"use client";

import { useState, useTransition } from "react";
import { shuffleRoom } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import type { getDictionary } from "../../../dictionaries";
import type { Locale } from "@/lib/i18n";

interface ShuffleButtonProps {
  roomId: string;
  isShuffled: boolean;
  participantsCount: number;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["shuffleButton"];
  locale: Locale;
}

export function ShuffleButton({
  roomId,
  isShuffled,
  participantsCount,
  dictionary,
  locale,
}: ShuffleButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleShuffle() {
    setError(null);
    startTransition(async () => {
      const result = await shuffleRoom(roomId, locale);
      if (result.success) {
        setShowConfirm(false);
        router.refresh();
      } else {
        setError(result.error || dictionary.confirmTitle);
      }
    });
  }

  if (isShuffled) {
    return (
      <div className="rounded-xl border border-emerald-600/30 bg-emerald-900/20 p-4 text-center">
        <div className="mb-1 text-lg">✅</div>
        <p className="font-medium text-emerald-400">{dictionary.completed}</p>
        <p className="mt-1 text-sm text-slate-400">{dictionary.assigned}</p>
      </div>
    );
  }

  if (participantsCount < 3) {
    return (
      <div className="text-center">
        <button
          disabled
          className="h-12 w-full cursor-not-allowed rounded-xl bg-slate-700 font-semibold text-slate-400"
        >
          {dictionary.run}
        </button>
        {participantsCount > 0 && (
          <p className="mt-2 text-sm text-slate-500">{dictionary.minRequired}</p>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="h-12 w-full rounded-xl bg-red-600 font-semibold text-white transition-all hover:bg-red-500"
      >
        {dictionary.run}
      </button>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
            <div className="mb-4 text-center text-4xl">⚠️</div>
            <h2 className="mb-2 text-center text-xl font-bold text-white">
              {dictionary.confirmTitle}
            </h2>
            <p className="mb-6 text-center text-slate-400">
              {dictionary.confirmMessage}
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-center text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-600 disabled:opacity-50"
              >
                {dictionary.cancel}
              </button>
              <button
                onClick={handleShuffle}
                disabled={isPending}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {dictionary.running}
                  </span>
                ) : (
                  dictionary.confirm
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

