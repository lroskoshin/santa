"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface Assignment {
  giver: string;
  receiver: string;
}

function shuffleAssignments(names: string[]): Assignment[] {
  if (names.length < 2) return [];

  // Fisher-Yates shuffle to get random order
  const shuffled = [...names];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Create circular assignment: each person gives to the next one
  // This guarantees no one gives to themselves
  const assignments: Assignment[] = [];
  for (let i = 0; i < shuffled.length; i++) {
    assignments.push({
      giver: shuffled[i],
      receiver: shuffled[(i + 1) % shuffled.length],
    });
  }

  // Sort by original names order for display
  const nameOrder = new Map(names.map((name, index) => [name.toLowerCase(), index]));
  assignments.sort((a, b) => {
    const orderA = nameOrder.get(a.giver.toLowerCase()) ?? 0;
    const orderB = nameOrder.get(b.giver.toLowerCase()) ?? 0;
    return orderA - orderB;
  });

  return assignments;
}

export default function ShufflePage() {
  const [input, setInput] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isShuffled, setIsShuffled] = useState(false);

  const handleShuffle = useCallback(() => {
    setError(null);

    // Parse names: split by comma, trim, filter empty
    const names = input
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    // Remove duplicates (case-insensitive)
    const uniqueNames: string[] = [];
    const seenLower = new Set<string>();
    for (const name of names) {
      const lower = name.toLowerCase();
      if (!seenLower.has(lower)) {
        seenLower.add(lower);
        uniqueNames.push(name);
      }
    }

    if (uniqueNames.length < 2) {
      setError("Нужно минимум 2 участника для распределения");
      setAssignments([]);
      setIsShuffled(false);
      return;
    }

    const result = shuffleAssignments(uniqueNames);
    setAssignments(result);
    setIsShuffled(true);
  }, [input]);

  const handleReset = useCallback(() => {
    setAssignments([]);
    setIsShuffled(false);
    setError(null);
  }, []);

  const handleReshuffle = useCallback(() => {
    handleShuffle();
  }, [handleShuffle]);

  return (
    <div className="flex flex-1 items-center justify-center bg-[#0c1222]">
      <main className="flex w-full max-w-lg flex-col items-center gap-8 px-6 py-12">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors self-start"
        >
          <span>←</span>
          <span className="text-sm">На главную</span>
        </Link>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-5xl">🎲</div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Быстрое распределение
          </h1>
          <p className="text-slate-400">
            Введите имена участников через запятую — мы мгновенно перемешаем их
          </p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="names" className="text-sm font-medium text-slate-300">
              Имена участников
            </label>
            <textarea
              id="names"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Маша, Петя, Вася, Катя, Дима"
              rows={4}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
            />
            <p className="text-xs text-slate-500">
              Разделяйте имена запятыми. Например: Аня, Борис, Вика
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {!isShuffled ? (
            <button
              onClick={handleShuffle}
              className="h-12 w-full rounded-xl bg-emerald-600 font-semibold text-white transition-all hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              🎲 Распределить
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleReshuffle}
                className="h-12 flex-1 rounded-xl bg-amber-600 font-semibold text-white transition-all hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                🔄 Перемешать заново
              </button>
              <button
                onClick={handleReset}
                className="h-12 px-6 rounded-xl border border-slate-600 font-medium text-slate-300 transition-all hover:border-slate-500 hover:bg-slate-800 focus:outline-none"
              >
                Сброс
              </button>
            </div>
          )}
        </div>

        {assignments.length > 0 && (
          <div className="w-full flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎁</span>
              <h2 className="text-lg font-semibold text-white">Результат распределения</h2>
            </div>

            <div className="flex flex-col gap-2">
              {assignments.map((assignment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 transition-all hover:border-slate-600"
                >
                  <span className="font-medium text-white min-w-0 flex-1 truncate">
                    {assignment.giver}
                  </span>
                  <span className="text-emerald-400 text-xl flex-shrink-0">→</span>
                  <span className="text-emerald-300 min-w-0 flex-1 truncate text-right">
                    {assignment.receiver}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 mt-2">
              <p className="text-sm text-amber-400">
                ⚠️ Эта страница не сохраняет данные. Сфотографируйте результат или запишите его!
              </p>
            </div>
          </div>
        )}

        <div className="w-full border-t border-slate-800 pt-6 mt-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-slate-500 text-sm">
              Хотите чтобы каждый узнал результат самостоятельно?
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              <span>Создать комнату с приглашениями</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

