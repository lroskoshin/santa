"use client";

import { joinRoom } from "@/app/actions/join-room";
import type { ActionState } from "@/app/actions/types";
import { useActionState } from "react";
import type { getDictionary } from "../../../dictionaries";
import type { Locale } from "@/lib/i18n";

interface JoinRoomFormProps {
  roomId: string;
  inviteToken: string;
  allowWishlist: boolean;
  requireEmail: boolean;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["join"];
  locale: Locale;
}

export function JoinRoomForm({
  roomId,
  inviteToken,
  allowWishlist,
  requireEmail,
  dictionary,
  locale,
}: JoinRoomFormProps) {
  const joinRoomWithParams = joinRoom.bind(null, roomId, inviteToken, locale);

  const [state, formAction, isPending] = useActionState<
    ActionState | null,
    FormData
  >(joinRoomWithParams, null);

  const nameError = state?.fieldErrors?.name?.[0];
  const emailError = state?.fieldErrors?.email?.[0];
  const wishlistError = state?.fieldErrors?.wishlist?.[0];

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-300">
          {dictionary.yourName}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder={dictionary.namePlaceholder}
          required
          maxLength={50}
          className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 text-white transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        {nameError && <p className="text-sm text-red-400">{nameError}</p>}
      </div>

      {requireEmail && (
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-300">
            {dictionary.email}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder={dictionary.emailPlaceholder}
            required
            maxLength={100}
            className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 text-white transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {emailError && <p className="text-sm text-red-400">{emailError}</p>}
          <p className="text-xs text-slate-500">{dictionary.emailHint}</p>
        </div>
      )}

      {allowWishlist && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="wishlist"
            className="text-sm font-medium text-slate-300"
          >
            {dictionary.wishlist}
            <span className="ml-2 text-slate-500">{dictionary.optional}</span>
          </label>
          <textarea
            id="wishlist"
            name="wishlist"
            placeholder={dictionary.wishlistPlaceholder}
            maxLength={500}
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {wishlistError && (
            <p className="text-sm text-red-400">{wishlistError}</p>
          )}
          <p className="text-xs text-slate-500">{dictionary.wishlistHint}</p>
          <p className="text-xs text-slate-500">
            {dictionary.wishlistWantGift}{" "}
            <a
              href="https://wantgift.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
            >
              WantGift
            </a>
            {dictionary.wishlistWantGiftLink}
          </p>
        </div>
      )}

      {state?.error && !nameError && !emailError && !wishlistError && (
        <p className="text-center text-sm text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-xl bg-emerald-600 font-semibold text-white transition-all hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? dictionary.submitting : dictionary.submit}
      </button>
    </form>
  );
}
