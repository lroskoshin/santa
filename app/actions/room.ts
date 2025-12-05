"use server";

import { prisma } from "../../lib/prisma";
import { createRoomSchema } from "../../lib/validations/room";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export interface ActionState {
  error?: string;
  fieldErrors?: {
    name?: string[];
  };
}

const USER_TOKEN_COOKIE = "santa_user_token";

async function getUserToken(): Promise<string> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(USER_TOKEN_COOKIE)?.value;

  if (existingToken) {
    return existingToken;
  }

  const newToken = nanoid(16);
  cookieStore.set(USER_TOKEN_COOKIE, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return newToken;
}

export async function getUserRooms() {
  const cookieStore = await cookies();
  const userToken = cookieStore.get(USER_TOKEN_COOKIE)?.value;

  if (!userToken) {
    return [];
  }

  const rooms = await prisma.room.findMany({
    where: {
      adminToken: userToken,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: {
        select: {
          participants: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return rooms;
}

export async function isRoomAdmin(roomId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const userToken = cookieStore.get(USER_TOKEN_COOKIE)?.value;

  if (!userToken) {
    return false;
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { adminToken: true },
  });

  if (!room) {
    return false;
  }

  return room.adminToken === userToken;
}

export async function createRoom(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState | null> {
  const rawData = {
    name: formData.get("name"),
    allowWishlist: formData.get("allowWishlist") !== "false",
  };

  const result = createRoomSchema.safeParse(rawData);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      error: "Проверьте введённые данные",
      fieldErrors: {
        name: fieldErrors.name,
      },
    };
  }

  const { name, allowWishlist } = result.data;

  const inviteToken = nanoid(10);
  const userToken = await getUserToken();

  const room = await prisma.room.create({
    data: {
      name,
      allowWishlist,
      inviteToken,
      adminToken: userToken,
    },
  });

  redirect(`/room/${room.id}/admin`);
}
