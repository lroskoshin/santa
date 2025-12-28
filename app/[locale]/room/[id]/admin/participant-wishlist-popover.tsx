"use client";

import { useState, useRef, useEffect } from "react";

interface ParticipantWishlistButtonProps {
  participantName: string;
  wishlist: string | null;
  dictionary: {
    clickToSeeWishes: string;
    wishes: string;
    noWishes: string;
  };
}

export function ParticipantWishlistButton({
  participantName,
  wishlist,
  dictionary,
}: ParticipantWishlistButtonProps) {
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

  const noWishesMessage = dictionary.noWishes.replace("{name}", participantName);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
          isOpen
            ? "bg-amber-500/30 text-amber-300"
            : "bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300"
        }`}
        title={dictionary.clickToSeeWishes}
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
        </svg>
      </button>
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-amber-500/30 bg-slate-800 p-4 shadow-xl animate-in fade-in-0 zoom-in-95"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 shrink-0">
              <span className="text-xl">💝</span>
            </div>
            <div>
              <p className="font-semibold text-white">{participantName}</p>
              <p className="text-xs text-amber-400">{dictionary.wishes}</p>
            </div>
          </div>

          <div className="rounded-md border border-amber-500/20 bg-slate-900/50 p-3">
            {wishlist ? (
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {wishlist}
              </p>
            ) : (
              <p className="text-sm text-slate-500 italic">{noWishesMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

