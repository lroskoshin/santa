"use client";

import { useState } from "react";

const PLAYLIST_URL = "https://music.yandex.ru/iframe/playlist/yamusic-bestsongs/337604";

// Responsive sizes for the player
const SIZES = {
  mobile: { width: 280, height: 280 },
  desktop: { width: 300, height: 300 },
} as const;

export function MusicPlayer() {
  const [isVisible, setIsVisible] = useState(false);
  // Whether iframe is loaded (false = removed from DOM, music stopped)
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStop = () => {
    // Remove iframe from DOM to stop music
    setIsPlaying(false);
    setIsVisible(false);
  };

  const handleTogglePlayer = () => {
    if (!isVisible) {
      // Opening player — also start playing if not already
      setIsVisible(true);
      setIsPlaying(true);
    } else {
      // Just hide, keep playing
      setIsVisible(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Control buttons */}
      <div className="flex items-center gap-1.5">
        {/* Stop button — removes iframe from DOM */}
        {isPlaying && (
          <button
            onClick={handleStop}
            className="group inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/90 backdrop-blur-sm text-xs font-medium transition-all hover:bg-slate-700/90 shadow-lg border border-slate-700/50"
            aria-label="Stop music"
            title="Stop music"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-3.5 w-3.5 text-rose-400 transition-colors group-hover:text-rose-300"
            >
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>
        )}

        {/* Show/Hide player button */}
        <button
          onClick={handleTogglePlayer}
          className="group inline-flex h-8 items-center gap-1.5 rounded-full bg-slate-800/90 backdrop-blur-sm px-3 text-xs font-medium transition-all hover:bg-slate-700/90 shadow-lg border border-slate-700/50"
          aria-label={isVisible ? "Hide player" : "Show player"}
        >
          {isVisible ? (
            // Chevron down icon (minimize)
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-200"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            // Music note icon
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`h-4 w-4 transition-colors ${isPlaying ? "text-emerald-400 group-hover:text-emerald-300" : "text-slate-400 group-hover:text-slate-200"}`}
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          )}
          <span className={`transition-colors ${isVisible ? "text-slate-400 group-hover:text-slate-200" : isPlaying ? "text-emerald-400 group-hover:text-emerald-300" : "text-slate-400 group-hover:text-slate-200"}`}>
            {isVisible ? "Hide" : "Music"}
          </span>
        </button>
      </div>

      {/* Yandex Music Player — removed from DOM when stopped */}
      {isPlaying && (
        <div 
          className={`absolute bottom-12 right-0 rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 transition-all duration-200 ${
            isVisible 
              ? "visible opacity-100 translate-y-0" 
              : "invisible opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          <iframe
            frameBorder="0"
            allow="clipboard-write"
            style={{ border: "none" }}
            className="w-[280px] h-[280px] sm:w-[300px] sm:h-[300px]"
            width={SIZES.desktop.width}
            height={SIZES.desktop.height}
            src={PLAYLIST_URL}
            title="Best of Christmas — Yandex Music"
          />
        </div>
      )}
    </div>
  );
}
