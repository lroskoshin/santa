"use client";

import { useState } from "react";
import type { getDictionary } from "../../../dictionaries";

interface CopyButtonProps {
  text: string;
  dictionary: Awaited<ReturnType<typeof getDictionary>>["copyButton"];
}

export function CopyButton({ text, dictionary }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-600"
    >
      {copied ? dictionary.copied : dictionary.copy}
    </button>
  );
}

