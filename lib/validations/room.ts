import { z } from "zod";

export const createRoomSchema = z.object({
  name: z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z
        .string()
        .min(1, "Название комнаты обязательно")
        .min(2, "Минимум 2 символа")
        .max(50, "Максимум 50 символов")
    ),
  allowWishlist: z.boolean().default(true),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;

export const joinRoomSchema = z.object({
  name: z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z
        .string()
        .min(1, "Имя обязательно")
        .min(2, "Минимум 2 символа")
        .max(50, "Максимум 50 символов")
    ),
  wishlist: z
    .string()
    .transform((v) => v.trim())
    .pipe(z.string().max(500, "Максимум 500 символов"))
    .optional()
    .transform((val) => val || null),
});

export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
