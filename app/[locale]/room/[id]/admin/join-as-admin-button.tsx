"use client";

import Link from "next/link";
import type { getDictionary } from "../../../dictionaries";

interface JoinAsAdminButtonProps {
  inviteUrl: string;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["admin"];
}

export function JoinAsAdminButton({
  inviteUrl,
  dictionary,
}: JoinAsAdminButtonProps) {
  return (
    <Link
      href={inviteUrl}
      className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-600 bg-slate-800/20 px-4 py-3 text-center transition-all hover:border-slate-500 hover:bg-slate-800/40"
    >
      <span className="text-xl">🎁</span>
      <div className="text-left">
        <p className="font-medium text-slate-300">
          {dictionary.joinAsParticipant}
        </p>
        <p className="text-xs text-slate-500">{dictionary.joinHint}</p>
      </div>
    </Link>
  );
}

