"use server";

import { prisma } from "../../lib/prisma";
import { isRoomAdmin } from "./queries";
import { shuffle, getUserToken } from "./utils";

/**
 * Провести жеребьёвку в комнате
 * Назначает каждому участнику другого участника (по кругу)
 */
export async function shuffleRoom(
  roomId: string
): Promise<{ success: boolean; error?: string }> {
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

  const shuffledParticipants = shuffle(room.participants);

  const assignments = shuffledParticipants.map((santa, index) => {
    const targetIndex = (index + 1) % shuffledParticipants.length;
    return {
      roomId: room.id,
      santaId: santa.id,
      targetId: shuffledParticipants[targetIndex].id,
    };
  });

  await prisma.$transaction([
    prisma.assignment.createMany({ data: assignments }),
    prisma.room.update({
      where: { id: roomId },
      data: { shuffledAt: new Date() },
    }),
  ]);

  return { success: true };
}

/**
 * Присоединиться к комнате как админ (стать участником)
 */
export async function joinAsAdmin(
  roomId: string,
  name: string,
  wishlist?: string
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await isRoomAdmin(roomId);
  if (!isAdmin) {
    return {
      success: false,
      error: "Только организатор может использовать эту функцию",
    };
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      shuffledAt: true,
      allowWishlist: true,
    },
  });

  if (!room) {
    return { success: false, error: "Комната не найдена" };
  }

  if (room.shuffledAt) {
    return {
      success: false,
      error: "Жеребьёвка уже проведена. Нельзя присоединиться.",
    };
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 50) {
    return {
      success: false,
      error: "Имя должно быть от 2 до 50 символов",
    };
  }

  const sessionId = await getUserToken();

  // Проверяем, не присоединился ли админ ранее
  const existingParticipant = await prisma.participant.findUnique({
    where: {
      roomId_sessionId: {
        roomId: room.id,
        sessionId,
      },
    },
  });

  if (existingParticipant) {
    // Обновляем данные
    await prisma.participant.update({
      where: { id: existingParticipant.id },
      data: {
        name: trimmedName,
        wishlist: room.allowWishlist ? wishlist?.trim() || null : null,
      },
    });
  } else {
    // Создаём нового участника
    await prisma.participant.create({
      data: {
        roomId: room.id,
        name: trimmedName,
        wishlist: room.allowWishlist ? wishlist?.trim() || null : null,
        sessionId,
      },
    });
  }

  return { success: true };
}
