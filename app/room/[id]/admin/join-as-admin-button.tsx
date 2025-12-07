"use client";

import { useState, useTransition } from "react";
import { joinAsAdmin } from "../../../actions/admin";
import { useRouter } from "next/navigation";

interface JoinAsAdminButtonProps {
  roomId: string;
  allowWishlist: boolean;
  isShuffled: boolean;
}

export function JoinAsAdminButton({
  roomId,
  allowWishlist,
  isShuffled,
}: JoinAsAdminButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [wishlist, setWishlist] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await joinAsAdmin(
        roomId,
        name,
        allowWishlist ? wishlist : undefined
      );

      if (result.success) {
        setName("");
        setWishlist("");
        setShowForm(false);
        router.refresh();
      } else {
        setError(result.error || "Произошла ошибка");
      }
    });
  }

  if (isShuffled) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="h-12 w-full rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 font-medium text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40"
      >
        🎅 Принять участие
      </button>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
            <div className="mb-4 text-center text-4xl">🎅</div>
            <h2 className="mb-2 text-center text-xl font-bold text-white">
              Присоединиться к игре
            </h2>
            <p className="mb-6 text-center text-slate-400">
              Введите своё имя, чтобы участвовать в жеребьёвке
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="admin-name"
                  className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                  Ваше имя
                </label>
                <input
                  id="admin-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите имя..."
                  className="h-11 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  disabled={isPending}
                  autoFocus
                />
              </div>

              {allowWishlist && (
                <div>
                  <label
                    htmlFor="admin-wishlist"
                    className="mb-1.5 block text-sm font-medium text-slate-300"
                  >
                    Пожелания к подарку{" "}
                    <span className="text-slate-500">(необязательно)</span>
                  </label>
                  <textarea
                    id="admin-wishlist"
                    value={wishlist}
                    onChange={(e) => setWishlist(e.target.value)}
                    placeholder="Что хотели бы получить..."
                    className="h-24 w-full resize-none rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    disabled={isPending}
                  />
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-500/20 p-3 text-center text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError(null);
                    setName("");
                    setWishlist("");
                  }}
                  disabled={isPending}
                  className="flex-1 rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-600 disabled:opacity-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isPending || name.trim().length < 2}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-amber-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Сохраняем...
                    </span>
                  ) : (
                    "Присоединиться"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

