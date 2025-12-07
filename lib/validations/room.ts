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
  requireEmail: z.boolean().default(false),
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
  email: z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z.string().email("Некорректный email").max(100, "Максимум 100 символов")
    )
    .optional()
    .transform((val) => val || null),
  wishlist: z
    .string()
    .transform((v) => v.trim())
    .pipe(z.string().max(500, "Максимум 500 символов"))
    .optional()
    .transform((val) => val || null),
});

export const joinRoomSchemaWithRequiredEmail = z.object({
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
  email: z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z
        .string()
        .min(1, "Email обязателен")
        .email("Некорректный email")
        .max(100, "Максимум 100 символов")
    ),
  wishlist: z
    .string()
    .transform((v) => v.trim())
    .pipe(z.string().max(500, "Максимум 500 символов"))
    .optional()
    .transform((val) => val || null),
});

export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
