"use server";

import { prisma } from "../../lib/prisma";
import {
  joinRoomSchema,
  joinRoomSchemaWithRequiredEmail,
} from "../../lib/validations/room";
import { MAX_PARTICIPANTS } from "../../lib/constants";
import { z } from "zod";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { getUserToken } from "./utils";
import type { ActionState } from "./types";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

const errorMessages = {
  ru: {
    invalidLink: "Недействительная ссылка приглашения",
    alreadyShuffled:
      "Жеребьёвка уже проведена. Новые участники не могут присоединиться.",
    checkData: "Проверьте введённые данные",
    limitReached: (max: number) =>
      `Достигнут лимит участников (${max}). Обратитесь к организатору.`,
  },
  en: {
    invalidLink: "Invalid invitation link",
    alreadyShuffled:
      "Draw has already been completed. New participants cannot join.",
    checkData: "Please check the entered data",
    limitReached: (max: number) =>
      `Participant limit reached (${max}). Contact the organizer.`,
  },
};

export async function joinRoom(
  roomId: string,
  inviteToken: string,
  locale: Locale,
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState | null> {
  const messages = errorMessages[locale];

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      inviteToken: true,
      allowWishlist: true,
      requireEmail: true,
      shuffledAt: true,
    },
  });

  if (!room || room.inviteToken !== inviteToken) {
    return {
      error: messages.invalidLink,
    };
  }

  if (room.shuffledAt) {
    return {
      error: messages.alreadyShuffled,
    };
  }

  const rawData = {
    name: formData.get("name"),
    email: ((formData.get("email") || "") as string).trim() || undefined,
    wishlist: formData.get("wishlist") || undefined,
  };

  const schema = room.requireEmail
    ? joinRoomSchemaWithRequiredEmail
    : joinRoomSchema;
  const result = schema.safeParse(rawData);

  if (!result.success) {
    const fieldErrors = z.flattenError(result.error).fieldErrors;
    return {
      error: messages.checkData,
      fieldErrors: {
        name: fieldErrors.name,
        email: fieldErrors.email,
        wishlist: fieldErrors.wishlist,
      },
    };
  }

  const { name, email, wishlist } = result.data;
  const sessionId = await getUserToken();

  const existingParticipant = await prisma.participant.findUnique({
    where: {
      roomId_sessionId: {
        roomId: room.id,
        sessionId,
      },
    },
  });

  if (existingParticipant) {
    await prisma.participant.update({
      where: { id: existingParticipant.id },
      data: {
        name,
        email: email ?? null,
        wishlist: room.allowWishlist ? wishlist : null,
      },
    });
  } else {
    // Atomic check-and-create to prevent race condition exceeding MAX_PARTICIPANTS
    // The INSERT only succeeds if current count < MAX_PARTICIPANTS
    const newId = nanoid(25);
    const wishlistValue = room.allowWishlist ? (wishlist ?? null) : null;

    const inserted = await prisma.$executeRaw`
      INSERT INTO "Participant" ("id", "roomId", "name", "email", "wishlist", "sessionId", "notificationsSent")
      SELECT
        ${newId},
        ${room.id},
        ${name},
        ${email ?? null},
        ${wishlistValue},
        ${sessionId},
        0
      WHERE (SELECT COUNT(*) FROM "Participant" WHERE "roomId" = ${room.id}) < ${MAX_PARTICIPANTS}
    `;

    if (inserted === 0) {
      return {
        error: messages.limitReached(MAX_PARTICIPANTS),
      };
    }
  }

  redirect(getLocalizedPath(`/room/${room.id}/joined`, locale));
}
