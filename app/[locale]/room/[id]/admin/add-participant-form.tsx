"use client";

import { useActionState, useState } from "react";
import { addParticipantByAdmin } from "@/app/actions/admin";
import type { Locale } from "@/lib/i18n";
import { ParticipantFormFields } from "@/components/participant-form-fields";

interface AddParticipantFormProps {
  roomId: string;
  allowWishlist: boolean;
  requireEmail: boolean;
  dictionary: {
    addParticipant: string;
    addManually: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    wishlist: string;
    wishlistPlaceholder: string;
    optional: string;
    cancel: string;
    add: string;
    adding: string;
  };
  locale: Locale;
}

export function AddParticipantForm({
  roomId,
  allowWishlist,
  requireEmail,
  dictionary,
  locale,
}: AddParticipantFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const boundAction = addParticipantByAdmin.bind(null, roomId, locale);

  const [state, formAction, isPending] = useActionState(
    async (
      prevState: { success: boolean; error?: string } | null,
      formData: FormData
    ) => {
      const result = await boundAction(prevState, formData);
      if (result.success) {
        setIsOpen(false);
      }
      return result;
    },
    null
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-600 bg-slate-800/30 px-4 py-3 text-slate-400 transition-colors hover:border-emerald-500/50 hover:bg-slate-800/50 hover:text-emerald-400"
      >
        <span className="text-lg">➕</span>
        <span>{dictionary.addManually}</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
      <h3 className="mb-4 flex items-center gap-2 font-medium text-white">
        <span>➕</span>
        {dictionary.addParticipant}
      </h3>

      <form action={formAction} className="flex flex-col gap-5">
        <ParticipantFormFields
          allowWishlist={allowWishlist}
          requireEmail={requireEmail}
          dictionary={dictionary}
        />

        {state?.error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {state.error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 rounded-xl border border-slate-600 px-4 py-3 text-slate-400 transition-colors hover:bg-slate-700"
          >
            {dictionary.cancel}
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? dictionary.adding : dictionary.add}
          </button>
        </div>
      </form>
    </div>
  );
}

