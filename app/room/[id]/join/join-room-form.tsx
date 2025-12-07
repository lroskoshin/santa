"use client";

import { joinRoom } from "../../../actions/join-room";
import type { ActionState } from "../../../actions/types";
import { useActionState } from "react";

interface JoinRoomFormProps {
  roomId: string;
  inviteToken: string;
  allowWishlist: boolean;
  requireEmail: boolean;
}

export function JoinRoomForm({ roomId, inviteToken, allowWishlist, requireEmail }: JoinRoomFormProps) {
  const joinRoomWithId = joinRoom.bind(null, roomId, inviteToken);
  
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    joinRoomWithId,
    null
  );

  const nameError = state?.fieldErrors?.name?.[0];
  const emailError = state?.fieldErrors?.email?.[0];
  const wishlistError = state?.fieldErrors?.wishlist?.[0];

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-300">
          Твоё имя
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Как тебя зовут?"
          required
          maxLength={50}
          className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
        {nameError && (
          <p className="text-sm text-red-400">{nameError}</p>
        )}
      </div>

      {requireEmail && (
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="your@email.com"
            required
            maxLength={100}
            className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          {emailError && (
            <p className="text-sm text-red-400">{emailError}</p>
          )}
          <p className="text-xs text-slate-500">
            Сюда прилетит письмо с результатом жеребьёвки. Проверь папку «Спам», если не найдёшь 📬
          </p>
        </div>
      )}

      {allowWishlist && (
        <div className="flex flex-col gap-2">
          <label htmlFor="wishlist" className="text-sm font-medium text-slate-300">
            Пожелания к подарку
            <span className="ml-2 text-slate-500">(необязательно)</span>
          </label>
          <textarea
            id="wishlist"
            name="wishlist"
            placeholder="Расскажи, что тебе нравится или чем увлекаешься. Это поможет Тайному Санте выбрать подарок 🎁"
            maxLength={500}
            rows={4}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
          />
          {wishlistError && (
            <p className="text-sm text-red-400">{wishlistError}</p>
          )}
          <p className="text-xs text-slate-500">
            Например: книги, настольные игры, что-нибудь для дома, кофе/чай
          </p>
        </div>
      )}

      {state?.error && !nameError && !emailError && !wishlistError && (
        <p className="text-sm text-red-400 text-center">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-xl bg-emerald-600 font-semibold text-white transition-all hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Присоединяемся..." : "🎅 Присоединиться"}
      </button>
    </form>
  );
}

