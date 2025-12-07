"use client";

import { createRoom } from "@/app/actions/create-room";
import type { ActionState } from "@/app/actions/types";
import { useActionState } from "react";
import type { getDictionary } from "../dictionaries";
import type { Locale } from "@/lib/i18n";

interface CreateRoomFormProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["createRoom"];
  locale: Locale;
}

export function CreateRoomForm({ dictionary, locale }: CreateRoomFormProps) {
  const createRoomWithLocale = createRoom.bind(null, locale);
  const [state, formAction, isPending] = useActionState<
    ActionState | null,
    FormData
  >(createRoomWithLocale, null);

  const nameError = state?.fieldErrors?.name?.[0];

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-300">
          {dictionary.roomName}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder={dictionary.placeholder}
          required
          maxLength={50}
          className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 text-white transition-all placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        {nameError && <p className="text-sm text-red-400">{nameError}</p>}
        {state?.error && !nameError && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <label className="group flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="allowWishlist"
            defaultChecked
            className="h-5 w-5 cursor-pointer rounded border-slate-600 bg-slate-800/50 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0"
          />
          <span className="text-sm text-slate-300 transition-colors group-hover:text-slate-200">
            {dictionary.allowWishlist}
          </span>
        </label>

        <label className="group flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="requireEmail"
            className="h-5 w-5 cursor-pointer rounded border-slate-600 bg-slate-800/50 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0"
          />
          <span className="text-sm text-slate-300 transition-colors group-hover:text-slate-200">
            {dictionary.requireEmail}
          </span>
        </label>
      </div>

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

