import { Suspense } from "react";
import { CreateRoomForm } from "./components/create-room-form";
import { RoomsCounter, RoomsCounterSkeleton } from "./components/rooms-counter";
import { UserRooms, UserRoomsSkeleton } from "./components/user-rooms";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#0c1222]">
      <main className="flex w-full max-w-md flex-col items-center gap-12 px-6 py-12">
        {/* Статический контент — рендерится мгновенно */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-6xl">🎅</div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Тайный Санта
          </h1>
          <p className="text-lg text-slate-400">
            Создай комнату и пригласи друзей
          </p>
        </div>

        <CreateRoomForm />

        <p className="text-sm text-slate-500">
          Каждый участник узнает, кому он дарит подарок 🎁
        </p>

        <div className="w-full border-t border-slate-800 pt-6">
          <Link
            href="/shuffle"
            className="flex items-center gap-3 w-full rounded-xl border border-slate-700 bg-slate-800/30 p-4 transition-all hover:border-slate-600 hover:bg-slate-800/50 group"
          >
            <span className="text-2xl">🎲</span>
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="font-medium text-slate-300 group-hover:text-white transition-colors">
                У меня уже есть список
              </span>
              <span className="text-sm text-slate-500">
                Быстро перемешать имена без регистрации
              </span>
            </div>
            <span className="text-slate-500 group-hover:text-slate-400 transition-colors">→</span>
          </Link>
        </div>

        {/* Динамический контент — стримится отдельно */}
        <Suspense fallback={<RoomsCounterSkeleton />}>
          <RoomsCounter />
        </Suspense>

        <Suspense fallback={<UserRoomsSkeleton />}>
          <UserRooms />
        </Suspense>
      </main>
    </div>
  );
}
