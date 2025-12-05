"use server";

import { prisma } from "../../lib/prisma";
import { createRoomSchema, joinRoomSchema } from "../../lib/validations/room";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export interface ActionState {
  error?: string;
  fieldErrors?: {
    name?: string[];
    wishlist?: string[];
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

export async function joinRoom(
  roomId: string,
  inviteToken: string,
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState | null> {
  // Verify the room exists and token is valid
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { id: true, inviteToken: true, allowWishlist: true },
  });

  if (!room || room.inviteToken !== inviteToken) {
    return {
      error: "Недействительная ссылка приглашения",
    };
  }

  const rawData = {
    name: formData.get("name"),
    wishlist: formData.get("wishlist") || undefined,
  };

  const result = joinRoomSchema.safeParse(rawData);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      error: "Проверьте введённые данные",
      fieldErrors: {
        name: fieldErrors.name,
        wishlist: fieldErrors.wishlist,
      },
    };
  }

  const { name, wishlist } = result.data;
  const sessionId = await getUserToken();

  // Check if user already joined this room
  const existingParticipant = await prisma.participant.findUnique({
    where: {
      roomId_sessionId: {
        roomId: room.id,
        sessionId,
      },
    },
  });

  if (existingParticipant) {
    // Update existing participant
    await prisma.participant.update({
      where: { id: existingParticipant.id },
      data: {
        name,
        wishlist: room.allowWishlist ? wishlist : null,
      },
    });
  } else {
    // Create new participant
    await prisma.participant.create({
      data: {
        roomId: room.id,
        name,
        wishlist: room.allowWishlist ? wishlist : null,
        sessionId,
      },
    });
  }

  redirect(`/room/${room.id}/joined`);
}
