"use server";

import { prisma } from "../../lib/prisma";
import { createRoomSchema } from "../../lib/validations/room";
import { z } from "zod";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { getUserToken } from "./utils";
import type { ActionState } from "./types";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

const errorMessages: Record<Locale, string> = {
  ru: "Проверьте введённые данные",
  en: "Please check the entered data",
};

export async function createRoom(
  locale: Locale,
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState | null> {
  const rawData = {
    name: formData.get("name"),
    allowWishlist: formData.has("allowWishlist"),
    requireEmail: formData.has("requireEmail"),
  };

  const result = createRoomSchema.safeParse(rawData);

  if (!result.success) {
    const fieldErrors = z.flattenError(result.error).fieldErrors;
    return {
      error: errorMessages[locale],
      fieldErrors: {
        name: fieldErrors.name,
      },
    };
  }

  const { name, allowWishlist, requireEmail } = result.data;

  const inviteToken = nanoid(10);
  const userToken = await getUserToken();

  const room = await prisma.room.create({
    data: {
      name,
      allowWishlist,
      requireEmail,
      locale,
      inviteToken,
      adminToken: userToken,
    },
  });

  redirect(getLocalizedPath(`/room/${room.id}/admin`, locale));
}
