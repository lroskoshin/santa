"use server";

import { prisma } from "../prisma";
import { resend, EMAIL_FROM } from "../email";
import { MAX_NOTIFICATIONS } from "../constants";
import { AssignmentNotificationEmail } from "./assignment-notification";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

interface ParticipantWithAssignment {
  id: string;
  name: string;
  email: string | null;
  notificationsSent: number;
  givenAssignment: {
    target: {
      name: string;
      wishlist: string | null;
    };
  } | null;
}

interface SendNotificationsParams {
  roomId: string;
  roomName: string;
  participants: ParticipantWithAssignment[];
  locale?: Locale;
}

const emailSubjects = {
  ru: {
    drawComplete: (roomName: string) =>
      `🎁 ${roomName} — жеребьёвка проведена!`,
    reminder: (roomName: string) => `🎁 ${roomName} — напоминание о жеребьёвке`,
  },
  en: {
    drawComplete: (roomName: string) => `🎁 ${roomName} — draw completed!`,
    reminder: (roomName: string) => `🎁 ${roomName} — draw reminder`,
  },
};

const errorMessages = {
  ru: {
    notFound: "Участник не найден",
    noEmail: "У участника нет email",
    notShuffled: "Жеребьёвка ещё не проведена",
    noAssignment: "Нет назначения для участника",
    limitReached: (max: number) => `Достигнут лимит отправок (${max})`,
    sendFailed: "Не удалось отправить письмо",
  },
  en: {
    notFound: "Participant not found",
    noEmail: "Participant has no email",
    notShuffled: "Draw has not been completed yet",
    noAssignment: "No assignment for participant",
    limitReached: (max: number) => `Send limit reached (${max})`,
    sendFailed: "Failed to send email",
  },
};

// Resend batch limit is 100 emails per request
const BATCH_SIZE = 100;

export async function sendAssignmentNotifications({
  roomId,
  roomName,
  participants,
  locale = "ru",
}: SendNotificationsParams): Promise<{ sent: number; failed: number }> {
  if (!resend) {
    console.warn("Resend is not configured, skipping email notifications");
    return { sent: 0, failed: 0 };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wesanta.club";
  const viewUrl = `${baseUrl}${getLocalizedPath(`/room/${roomId}/joined`, locale)}`;
  const subjects = emailSubjects[locale];

  const participantsWithEmail = participants.filter(
    (
      p
    ): p is ParticipantWithAssignment & {
      email: string;
      givenAssignment: NonNullable<
        ParticipantWithAssignment["givenAssignment"]
      >;
    } =>
      !!p.email &&
      !!p.givenAssignment &&
      p.notificationsSent < MAX_NOTIFICATIONS
  );

  if (participantsWithEmail.length === 0) {
    return { sent: 0, failed: 0 };
  }

  // Prepare all emails for batch sending
  const emailsToSend = participantsWithEmail.map((participant) => {
    const { email, name, givenAssignment } = participant;
    const { target } = givenAssignment;

    return {
      from: EMAIL_FROM,
      to: email,
      subject: subjects.drawComplete(roomName),
      react: AssignmentNotificationEmail({
        santaName: name,
        targetName: target.name,
        targetWishlist: target.wishlist,
        roomName,
        viewUrl,
        locale,
      }),
    };
  });

  let sent = 0;
  let failed = 0;

  // Send emails in batches of BATCH_SIZE
  for (let i = 0; i < emailsToSend.length; i += BATCH_SIZE) {
    const batch = emailsToSend.slice(i, i + BATCH_SIZE);
    const batchParticipants = participantsWithEmail.slice(i, i + BATCH_SIZE);

    try {
      const result = await resend.batch.send(batch);

      if (result.error) {
        console.error("Batch send error:", result.error);
        failed += batch.length;
        continue;
      }

      // All emails in batch sent successfully
      const successCount = result.data?.data?.length ?? batch.length;
      sent += successCount;

      // Update notification counters for all participants in batch
      await prisma.participant.updateMany({
        where: {
          id: { in: batchParticipants.map((p) => p.id) },
        },
        data: { notificationsSent: { increment: 1 } },
      });
    } catch (error) {
      console.error("Failed to send batch:", error);
      failed += batch.length;
    }
  }

  return { sent, failed };
}

/**
 * Resend notification to a specific participant (max 3 times total)
 */
export async function resendNotificationToParticipant(
  participantId: string
): Promise<{ success: boolean; error?: string }> {
  // Locale is determined from room after fetching participant

  if (!resend) {
    return { success: false, error: "Email service not configured" };
  }

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: {
      room: {
        select: {
          id: true,
          name: true,
          locale: true,
          shuffledAt: true,
        },
      },
      givenAssignment: {
        include: {
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

  if (!participant) {
    return { success: false, error: errorMessages.ru.notFound };
  }

  // Use locale from room
  const locale = (participant.room.locale as Locale) || "ru";
  const messages = errorMessages[locale];
  const subjects = emailSubjects[locale];

  if (!participant.email) {
    return { success: false, error: messages.noEmail };
  }

  if (!participant.room.shuffledAt) {
    return { success: false, error: messages.notShuffled };
  }

  if (!participant.givenAssignment) {
    return { success: false, error: messages.noAssignment };
  }

  if (participant.notificationsSent >= MAX_NOTIFICATIONS) {
    return {
      success: false,
      error: messages.limitReached(MAX_NOTIFICATIONS),
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wesanta.club";
  const viewUrl = `${baseUrl}${getLocalizedPath(`/room/${participant.room.id}/joined`, locale)}`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: participant.email,
      subject: subjects.reminder(participant.room.name),
      react: AssignmentNotificationEmail({
        santaName: participant.name,
        targetName: participant.givenAssignment.target.name,
        targetWishlist: participant.givenAssignment.target.wishlist,
        roomName: participant.room.name,
        viewUrl,
        locale,
      }),
    });

    await prisma.participant.update({
      where: { id: participantId },
      data: { notificationsSent: { increment: 1 } },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to resend notification:", error);
    return { success: false, error: messages.sendFailed };
  }
}
