"use server";

import { prisma } from "../prisma";
import { resend, EMAIL_FROM } from "../email";
import { MAX_NOTIFICATIONS } from "../constants";
import { AssignmentNotificationEmail } from "./assignment-notification";

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
}

// Resend batch limit is 100 emails per request
const BATCH_SIZE = 100;

export async function sendAssignmentNotifications({
  roomId,
  roomName,
  participants,
}: SendNotificationsParams): Promise<{ sent: number; failed: number }> {
  if (!resend) {
    console.warn("Resend is not configured, skipping email notifications");
    return { sent: 0, failed: 0 };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wesanta.club";
  const viewUrl = `${baseUrl}/room/${roomId}/joined`;

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
      subject: `🎁 ${roomName} — жеребьёвка проведена!`,
      react: AssignmentNotificationEmail({
        santaName: name,
        targetName: target.name,
        targetWishlist: target.wishlist,
        roomName,
        viewUrl,
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
    return { success: false, error: "Участник не найден" };
  }

  if (!participant.email) {
    return { success: false, error: "У участника нет email" };
  }

  if (!participant.room.shuffledAt) {
    return { success: false, error: "Жеребьёвка ещё не проведена" };
  }

  if (!participant.givenAssignment) {
    return { success: false, error: "Нет назначения для участника" };
  }

  if (participant.notificationsSent >= MAX_NOTIFICATIONS) {
    return {
      success: false,
      error: `Достигнут лимит отправок (${MAX_NOTIFICATIONS})`,
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wesanta.club";
  const viewUrl = `${baseUrl}/room/${participant.room.id}/joined`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: participant.email,
      subject: `🎁 ${participant.room.name} — напоминание о жеребьёвке`,
      react: AssignmentNotificationEmail({
        santaName: participant.name,
        targetName: participant.givenAssignment.target.name,
        targetWishlist: participant.givenAssignment.target.wishlist,
        roomName: participant.room.name,
        viewUrl,
      }),
    });

    await prisma.participant.update({
      where: { id: participantId },
      data: { notificationsSent: { increment: 1 } },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to resend notification:", error);
    return { success: false, error: "Не удалось отправить письмо" };
  }
}
