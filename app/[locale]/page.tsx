import { Suspense } from "react";
import { CreateRoomForm } from "./components/create-room-form";
import { RoomsCounter, RoomsCounterSkeleton } from "./components/rooms-counter";
import { UserRooms, UserRoomsSkeleton } from "./components/user-rooms";
import Link from "next/link";
import { getDictionary } from "./dictionaries";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

interface HomeProps {
  params: Promise<{ locale: Locale }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex w-full max-w-md flex-col items-center gap-12 px-6 py-12">
        {/* Static content */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-6xl">🎅</div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {dict.home.title}
          </h1>
          <p className="text-lg text-slate-400">{dict.home.subtitle}</p>
        </div>

        <CreateRoomForm dictionary={dict.createRoom} locale={locale} />

        {/* How it works */}
        <div className="w-full space-y-4">
          <h2 className="text-center text-sm font-medium uppercase tracking-wider text-slate-500">
            {dict.home.howItWorks}
          </h2>
          <div className="grid gap-3">
            <div className="flex items-start gap-3 rounded-lg bg-slate-800/20 p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                1
              </span>
              <p className="text-sm text-slate-400">{dict.home.step1}</p>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-slate-800/20 p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                2
              </span>
              <p className="text-sm text-slate-400">{dict.home.step2}</p>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-slate-800/20 p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                3
              </span>
              <p className="text-sm text-slate-400">{dict.home.step3}</p>
            </div>
          </div>
        </div>

        {/* For whom */}
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          <span className="rounded-full bg-slate-800/50 px-3 py-1 text-slate-400">
            {dict.home.forFamily}
          </span>
          <span className="rounded-full bg-slate-800/50 px-3 py-1 text-slate-400">
            {dict.home.forFriends}
          </span>
          <span className="rounded-full bg-slate-800/50 px-3 py-1 text-slate-400">
            {dict.home.forColleagues}
          </span>
        </div>

        <div className="w-full border-t border-slate-800 pt-6">
          <Link
            href={getLocalizedPath("/shuffle", locale)}
            className="group flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/30 p-4 transition-all hover:border-slate-600 hover:bg-slate-800/50"
          >
            <span className="text-2xl">🎲</span>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="font-medium text-slate-300 transition-colors group-hover:text-white">
                {dict.home.haveList}
              </span>
              <span className="text-sm text-slate-500">
                {dict.home.quickShuffle}
              </span>
            </div>
            <span className="text-slate-500 transition-colors group-hover:text-slate-400">
              →
            </span>
          </Link>
        </div>

        {/* Dynamic content — streamed separately */}
        <Suspense fallback={<RoomsCounterSkeleton />}>
          <RoomsCounter dictionary={dict.roomsCounter} />
        </Suspense>

        <Suspense fallback={<UserRoomsSkeleton />}>
          <UserRooms dictionary={dict.userRooms} locale={locale} />
        </Suspense>

        {/* Partner */}
        <div className="w-full border-t border-slate-800 pt-6">
          <a
            href="https://wantgift.app"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/20 p-4 transition-all hover:border-slate-600 hover:bg-slate-800/40"
          >
            <span className="text-2xl">🎁</span>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="font-medium text-slate-400 transition-colors group-hover:text-slate-300">
                {dict.home.partner}
              </span>
              <span className="text-sm text-slate-500">
                {dict.home.partnerDescription}
              </span>
            </div>
            <span className="text-slate-600 transition-colors group-hover:text-slate-500">
              ↗
            </span>
          </a>
        </div>
      </main>
    </div>
  );
}

