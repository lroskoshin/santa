"use client";

import { useState, useRef, useEffect } from "react";

interface ParticipantAssignmentButtonProps {
  santaName: string;
  targetName: string | null;
  targetWishlist: string | null;
  dictionary: {
    assignmentInfo: string;
    noAssignment: string;
    clickToSeeAssignment: string;
    wishes: string;
    noWishes: string;
  };
}

export function ParticipantAssignmentButton({
  santaName,
  targetName,
  targetWishlist,
  dictionary,
}: ParticipantAssignmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const message = targetName
    ? dictionary.assignmentInfo
        .replace("{santa}", santaName)
        .replace("{target}", targetName)
    : dictionary.noAssignment;

  const noWishesMessage = targetName
    ? dictionary.noWishes.replace("{name}", targetName)
    : "";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
          isOpen
            ? "bg-emerald-500/30 text-emerald-300"
            : "bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300"
        }`}
        title={dictionary.clickToSeeAssignment}
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
          <path
            fillRule="evenodd"
            d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-emerald-500/30 bg-slate-800 p-4 shadow-xl animate-in fade-in-0 zoom-in-95"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 shrink-0">
              <span className="text-xl">🎁</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{message}</p>
          </div>
          {targetName && (
            <>
              <div className="mt-3 flex items-center justify-center gap-3 rounded-md bg-slate-900/50 px-4 py-3 border border-slate-700">
                <span className="font-semibold text-emerald-400">{santaName}</span>
                <span className="text-2xl">🎅→🎁</span>
                <span className="font-semibold text-amber-400">{targetName}</span>
              </div>

              {/* Target's wishlist */}
              <div className="mt-3 rounded-md border border-amber-500/20 bg-slate-900/50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">💝</span>
                  <span className="text-xs font-medium text-amber-400">
                    {dictionary.wishes}
                  </span>
                </div>
                {targetWishlist ? (
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {targetWishlist}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 italic">{noWishesMessage}</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
