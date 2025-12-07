import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { USER_TOKEN_COOKIE } from "./types";

export async function getUserToken(): Promise<string> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(USER_TOKEN_COOKIE)?.value;

  if (existingToken) {
    return existingToken;
  }

  const newToken = nanoid(16);
  cookieStore.set(USER_TOKEN_COOKIE, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return newToken;
}

/**
 * Fisher-Yates shuffle для случайного перемешивания массива
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
