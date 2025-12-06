"use server";

import { prisma } from "../../lib/prisma";
import { createRoomSchema, joinRoomSchema } from "../../lib/validations/room";
import { z } from "zod";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";

export interface ActionState {
  error?: string;
  fieldErrors?: {
    name?: string[];
    wishlist?: string[];
  };
}

const USER_TOKEN_COOKIE = "santa_user_token";

export const getTotalRoomsCount = unstable_cache(
  async () => {
    const count = await prisma.room.count();
    return count;
  },
  ["total-rooms-count"],
  { revalidate: 60 } // Обновляем кэш каждые 60 секунд
);

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
    allowWishlist: formData.has("allowWishlist"),
  };

  const result = createRoomSchema.safeParse(rawData);

  if (!result.success) {
    const fieldErrors = z.flattenError(result.error).fieldErrors;
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
    select: {
      id: true,
      inviteToken: true,
      allowWishlist: true,
      shuffledAt: true,
    },
  });

  if (!room || room.inviteToken !== inviteToken) {
    return {
      error: "Недействительная ссылка приглашения",
    };
  }

  // Проверяем что жеребьёвка ещё не проведена
  if (room.shuffledAt) {
    return {
      error:
        "Жеребьёвка уже проведена. Новые участники не могут присоединиться.",
    };
  }

  const rawData = {
    name: formData.get("name"),
    wishlist: formData.get("wishlist") || undefined,
  };

  const result = joinRoomSchema.safeParse(rawData);

  if (!result.success) {
    const fieldErrors = z.flattenError(result.error).fieldErrors;
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

/**
 * Fisher-Yates shuffle для случайного перемешивания массива
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Провести жеребьёвку в комнате
 * Назначает каждому участнику другого участника (по кругу)
 */
export async function shuffleRoom(
  roomId: string
): Promise<{ success: boolean; error?: string }> {
  // Проверяем что пользователь - админ
  const isAdmin = await isRoomAdmin(roomId);
  if (!isAdmin) {
    return {
      success: false,
      error: "Только организатор может запустить распределение",
    };
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      participants: true,
      assignments: true,
    },
  });

  if (!room) {
    return { success: false, error: "Комната не найдена" };
  }

  if (room.shuffledAt) {
    return { success: false, error: "Жеребьёвка уже была проведена" };
  }

  if (room.participants.length < 3) {
    return { success: false, error: "Нужно минимум 3 участника" };
  }

  // Перемешиваем участников случайным образом
  const shuffledParticipants = shuffle(room.participants);

  // Создаём assignments по кругу: каждый дарит следующему
  // Последний дарит первому
  const assignments = shuffledParticipants.map((santa, index) => {
    const targetIndex = (index + 1) % shuffledParticipants.length;
    return {
      roomId: room.id,
      santaId: santa.id,
      targetId: shuffledParticipants[targetIndex].id,
    };
  });

  // Транзакция: создаём все назначения и помечаем комнату как распределённую
  await prisma.$transaction([
    prisma.assignment.createMany({ data: assignments }),
    prisma.room.update({
      where: { id: roomId },
      data: { shuffledAt: new Date() },
    }),
  ]);

  return { success: true };
}
