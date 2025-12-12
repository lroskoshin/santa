"use client";

import { joinRoom } from "@/app/actions/join-room";
import type { ActionState } from "@/app/actions/types";
import { useActionState } from "react";
import type { getDictionary } from "../../../dictionaries";
import type { Locale } from "@/lib/i18n";
import { ParticipantFormFields } from "@/components/participant-form-fields";

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

  const hasFieldErrors =
    state?.fieldErrors?.name ||
    state?.fieldErrors?.email ||
    state?.fieldErrors?.wishlist;

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <ParticipantFormFields
        allowWishlist={allowWishlist}
        requireEmail={requireEmail}
        dictionary={dictionary}
        fieldErrors={state?.fieldErrors}
      />

      {state?.error && !hasFieldErrors && (
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
