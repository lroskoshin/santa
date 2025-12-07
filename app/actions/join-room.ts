"use server";

import { prisma } from "../../lib/prisma";
import {
  joinRoomSchema,
  joinRoomSchemaWithRequiredEmail,
} from "../../lib/validations/room";
import { z } from "zod";
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
    email: formData.get("email") || undefined,
    wishlist: formData.get("wishlist") || undefined,
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
    await prisma.participant.create({
      data: {
        roomId: room.id,
        name,
        email: email ?? null,
        wishlist: room.allowWishlist ? wishlist : null,
        sessionId,
      },
    });
  }

  redirect(`/room/${room.id}/joined`);
}

