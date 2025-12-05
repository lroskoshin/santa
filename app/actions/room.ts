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

const ADMIN_TOKENS_COOKIE = "santa_admin_tokens";

async function saveAdminToken(adminToken: string) {
  const cookieStore = await cookies();
  const existingTokens = cookieStore.get(ADMIN_TOKENS_COOKIE)?.value;
  const tokens = existingTokens ? existingTokens.split(",") : [];

  if (!tokens.includes(adminToken)) {
    tokens.push(adminToken);
  }

  cookieStore.set(ADMIN_TOKENS_COOKIE, tokens.join(","), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

export async function getUserRooms() {
  const cookieStore = await cookies();
  const tokensString = cookieStore.get(ADMIN_TOKENS_COOKIE)?.value;

  if (!tokensString) {
    return [];
  }

  const tokens = tokensString.split(",").filter(Boolean);

  if (tokens.length === 0) {
    return [];
  }

  const rooms = await prisma.room.findMany({
    where: {
      adminToken: {
        in: tokens,
      },
    },
    select: {
      id: true,
      name: true,
      adminToken: true,
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
  const adminToken = nanoid(16);

  const room = await prisma.room.create({
    data: {
      name,
      allowWishlist,
      inviteToken,
      adminToken,
    },
  });

  await saveAdminToken(adminToken);

  redirect(`/room/${room.id}/admin?token=${adminToken}`);
}
