"use server";

import { prisma } from "../../lib/prisma";
import { createRoomSchema } from "../../lib/validations/room";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";

export interface ActionState {
  error?: string;
  fieldErrors?: {
    name?: string[];
  };
}

export async function createRoom(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState | null> {
  const rawData = {
    name: formData.get("name"),
    allowWishlist: formData.get("allowWishlist") !== "false",
  };

  const result = createRoomSchema.safeParse(rawData);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      error: "Проверьте введённые данные",
      fieldErrors: {
        name: fieldErrors.name,
      },
    };
  }

  const { name, allowWishlist } = result.data;

  const inviteToken = nanoid(10);
  const adminToken = nanoid(16);

  const room = await prisma.room.create({
    data: {
      name,
      allowWishlist,
      inviteToken,
      adminToken,
    },
  });

  redirect(`/room/${room.id}/admin?token=${adminToken}`);
}
