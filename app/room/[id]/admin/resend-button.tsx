"use client";

import { useState, useTransition } from "react";
import { resendNotification } from "../../../actions/admin";
import { MAX_NOTIFICATIONS } from "../../../../lib/constants";

interface ResendButtonProps {
  roomId: string;
  participantId: string;
  participantName: string;
  notificationsSent: number;
  hasEmail: boolean;
}

export function ResendButton({
  roomId,
  participantId,
  participantName,
  notificationsSent,
  hasEmail,
}: ResendButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [localCount, setLocalCount] = useState(notificationsSent);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canResend = hasEmail && localCount < MAX_NOTIFICATIONS;
  const remaining = MAX_NOTIFICATIONS - localCount;

  async function handleResend() {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await resendNotification(roomId, participantId);

      if (result.success) {
        setLocalCount((prev) => prev + 1);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Ошибка отправки");
        setTimeout(() => setError(null), 5000);
      }
    });
  }

  if (!hasEmail) {
    return (
      <span className="text-xs text-slate-600" title="Нет email">
        —
      </span>
    );
  }

  if (localCount >= MAX_NOTIFICATIONS) {
    return (
      <span className="text-xs text-slate-500" title="Лимит исчерпан">
        ✓ {localCount}/{MAX_NOTIFICATIONS}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleResend}
        disabled={isPending || !canResend}
        className="rounded-md bg-slate-700 px-2 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        title={`Отправить письмо ${participantName} (осталось ${remaining})`}
      >
        {isPending ? (
          <span className="inline-flex items-center gap-1">
            <svg
              className="h-3 w-3 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Отправка...
          </span>
        ) : success ? (
          <span className="text-emerald-400">✓ Отправлено</span>
        ) : (
          <span>📧 Переотправить</span>
        )}
      </button>
      <span className="text-xs text-slate-500">
        {localCount}/{MAX_NOTIFICATIONS}
      </span>
      {error && (
        <span className="text-xs text-red-400" title={error}>
          !
        </span>
      )}
    </div>
  );
}

