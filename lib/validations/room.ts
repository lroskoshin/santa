import { z } from "zod";

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(1, "Название комнаты обязательно")
    .min(2, "Минимум 2 символа")
    .max(50, "Максимум 50 символов")
    .trim(),
  allowWishlist: z.boolean().default(true),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
