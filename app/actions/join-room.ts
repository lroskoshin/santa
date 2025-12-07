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

export async function joinRoom(
  roomId: string,
  inviteToken: string,
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState | null> {
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
      error: "Недействительная ссылка приглашения",
    };
  }

  if (room.shuffledAt) {
    return {
      error:
        "Жеребьёвка уже проведена. Новые участники не могут присоединиться.",
    };
  }

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    wishlist: formData.get("wishlist") ?? "",
  };

  const schema = room.requireEmail
    ? joinRoomSchemaWithRequiredEmail
    : joinRoomSchema;
  const result = schema.safeParse(rawData);

  if (!result.success) {
    const fieldErrors = z.flattenError(result.error).fieldErrors;
    return {
      error: "Проверьте введённые данные",
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
        error: `Достигнут лимит участников (${MAX_PARTICIPANTS}). Обратитесь к организатору.`,
      };
    }
  }

  redirect(`/room/${room.id}/joined`);
}
