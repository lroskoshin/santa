"use server";

import { prisma } from "../../lib/prisma";
import {
  sendAssignmentNotifications,
  resendNotificationToParticipant,
} from "../../lib/emails/send-assignment-notifications";
import { isRoomAdmin } from "./queries";
import { shuffle } from "./utils";

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

  // Send email notifications to participants with emails
  const participantsWithAssignments = await prisma.participant.findMany({
    where: { roomId: room.id },
    select: {
      id: true,
      name: true,
      email: true,
      notificationsSent: true,
      givenAssignment: {
        select: {
          target: {
            select: {
              name: true,
              wishlist: true,
            },
          },
        },
      },
    },
  });

  // Fire and forget - don't block response on email sending
  sendAssignmentNotifications({
    roomId: room.id,
    roomName: room.name,
    participants: participantsWithAssignments,
  }).catch((error) => {
    console.error("Failed to send assignment notifications:", error);
  });

  return { success: true };
}

/**
 * Повторно отправить уведомление участнику (только админ)
 */
export async function resendNotification(
  roomId: string,
  participantId: string
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await isRoomAdmin(roomId);
  if (!isAdmin) {
    return {
      success: false,
      error: "Только организатор может отправлять уведомления",
    };
  }

  // Verify participant belongs to this room
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    select: { roomId: true },
  });

  if (!participant || participant.roomId !== roomId) {
    return { success: false, error: "Участник не найден в этой комнате" };
  }

  return resendNotificationToParticipant(participantId);
}
