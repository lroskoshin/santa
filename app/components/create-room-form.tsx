"use client";

import { createRoom } from "../actions/create-room";
import type { ActionState } from "../actions/types";
import { useActionState } from "react";

export function CreateRoomForm() {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    createRoom,
    null
  );

  const nameError = state?.fieldErrors?.name?.[0];

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-300">
          Название комнаты
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Новогодний офис 2025"
          required
          maxLength={50}
          className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
        {nameError && (
          <p className="text-sm text-red-400">{nameError}</p>
        )}
        {state?.error && !nameError && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="allowWishlist"
            defaultChecked
            className="h-5 w-5 rounded border-slate-600 bg-slate-800/50 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
            Разрешить участникам указывать пожелания к подарку
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="requireEmail"
            className="h-5 w-5 rounded border-slate-600 bg-slate-800/50 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
            Требовать email от участников
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-xl bg-emerald-600 font-semibold text-white transition-all hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Создаём..." : "Создать комнату"}
      </button>
    </form>
  );
}
