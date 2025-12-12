"use server";

import { prisma } from "../../lib/prisma";
import {
  sendAssignmentNotifications,
  resendNotificationToParticipant,
} from "../../lib/emails/send-assignment-notifications";
import { isRoomAdmin } from "./queries";
import { shuffle } from "./utils";
import type { Locale } from "@/lib/i18n";
import { nanoid } from "nanoid";
import { MAX_PARTICIPANTS } from "@/lib/constants";
import { revalidatePath } from "next/cache";

const errorMessages = {
  ru: {
    notAdmin: "Только организатор может запустить распределение",
    roomNotFound: "Комната не найдена",
    alreadyShuffled: "Жеребьёвка уже была проведена",
    minParticipants: "Нужно минимум 3 участника",
    notAdminNotify: "Только организатор может отправлять уведомления",
    participantNotFound: "Участник не найден в этой комнате",
    notAdminAdd: "Только организатор может добавлять участников",
    nameRequired: "Имя обязательно",
    limitReached: (max: number) =>
      `Достигнут лимит участников (${max}). Нельзя добавить больше.`,
  },
  en: {
    notAdmin: "Only the organizer can run the draw",
    roomNotFound: "Room not found",
    alreadyShuffled: "Draw has already been completed",
    minParticipants: "Need at least 3 participants",
    notAdminNotify: "Only the organizer can send notifications",
    participantNotFound: "Participant not found in this room",
    notAdminAdd: "Only the organizer can add participants",
    nameRequired: "Name is required",
    limitReached: (max: number) =>
      `Participant limit reached (${max}). Cannot add more.`,
  },
};

/**
 * Run draw in the room
 * Assigns each participant to another participant (in a circle)
 */
export async function shuffleRoom(
  roomId: string,
  locale: Locale = "ru"
): Promise<{ success: boolean; error?: string }> {
  const messages = errorMessages[locale];

  const isAdmin = await isRoomAdmin(roomId);
  if (!isAdmin) {
    return {
      success: false,
      error: messages.notAdmin,
    };
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      participants: true,
      assignments: true,
    },
  });

  // Use room's locale for emails and notifications
  const roomLocale = (room?.locale as Locale) || "ru";

  if (!room) {
    return { success: false, error: messages.roomNotFound };
  }

  if (room.shuffledAt) {
    return { success: false, error: messages.alreadyShuffled };
  }

  if (room.participants.length < 3) {
    return { success: false, error: messages.minParticipants };
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

  // Use atomic compare-and-set to prevent race conditions:
  // Only one concurrent request can successfully update shuffledAt from null
  const shuffleResult = await prisma.$transaction(async (tx) => {
    // Atomically claim the shuffle by updating shuffledAt only if it's still null
    const updated = await tx.room.updateMany({
      where: { id: roomId, shuffledAt: null },
      data: { shuffledAt: new Date() },
    });

    // If no rows were updated, another request already claimed the shuffle
    if (updated.count === 0) {
      return { claimed: false as const };
    }

    // We won the race - safe to create assignments
    await tx.assignment.createMany({ data: assignments });
    return { claimed: true as const };
  });

  if (!shuffleResult.claimed) {
    return { success: false, error: messages.alreadyShuffled };
  }

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
    locale: roomLocale,
  }).catch((error) => {
    console.error("Failed to send assignment notifications:", error);
  });

  return { success: true };
}

/**
 * Resend notification to participant (admin only)
 */
export async function resendNotification(
  roomId: string,
  participantId: string,
  locale: Locale = "ru"
): Promise<{ success: boolean; error?: string }> {
  const messages = errorMessages[locale];

  const isAdmin = await isRoomAdmin(roomId);
  if (!isAdmin) {
    return {
      success: false,
      error: messages.notAdminNotify,
    };
  }

  // Verify participant belongs to this room
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    select: { roomId: true },
  });

  if (!participant || participant.roomId !== roomId) {
    return { success: false, error: messages.participantNotFound };
  }

  return resendNotificationToParticipant(participantId);
}

/**
 * Add participant by admin (before shuffle)
 */
export async function addParticipantByAdmin(
  roomId: string,
  locale: Locale = "ru",
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const messages = errorMessages[locale];

  const isAdmin = await isRoomAdmin(roomId);
  if (!isAdmin) {
    return {
      success: false,
      error: messages.notAdminAdd,
    };
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    return { success: false, error: messages.roomNotFound };
  }

  if (room.shuffledAt) {
    return { success: false, error: messages.alreadyShuffled };
  }

  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim() || null;
  const wishlist = formData.get("wishlist")?.toString().trim() || null;

  if (!name) {
    return { success: false, error: messages.nameRequired };
  }

  // Atomic check-and-create to prevent race condition exceeding MAX_PARTICIPANTS
  const newId = nanoid(25);
  const wishlistValue = room.allowWishlist ? wishlist : null;

  const inserted = await prisma.$executeRaw`
    INSERT INTO "Participant" ("id", "roomId", "name", "email", "wishlist", "sessionId", "notificationsSent")
    SELECT
      ${newId},
      ${room.id},
      ${name},
      ${email},
      ${wishlistValue},
      NULL,
      0
    WHERE (SELECT COUNT(*) FROM "Participant" WHERE "roomId" = ${room.id}) < ${MAX_PARTICIPANTS}
  `;

  if (inserted === 0) {
    return {
      success: false,
      error: messages.limitReached(MAX_PARTICIPANTS),
    };
  }

  // Revalidate admin page to show the new participant
  revalidatePath(`/${locale}/room/${roomId}/admin`);

  return { success: true };
}
