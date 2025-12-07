import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { AutoRefresh } from "@/components/auto-refresh";
import { getDictionary } from "../../../dictionaries";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import { isRoomAdmin } from "@/app/actions/queries";

interface JoinedPageProps {
  params: Promise<{ id: string; locale: Locale }>;
}

const USER_TOKEN_COOKIE = "santa_user_token";

export default async function JoinedPage({ params }: JoinedPageProps) {
  const { id, locale } = await params;
  const dict = await getDictionary(locale);

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(USER_TOKEN_COOKIE)?.value;

  if (!sessionId) {
    redirect(getLocalizedPath("/", locale));
  }

  const room = await prisma.room.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      inviteToken: true,
      shuffledAt: true,
      _count: {
        select: { participants: true },
      },
    },
  });

  if (!room) {
    notFound();
  }

  const participant = await prisma.participant.findUnique({
    where: {
      roomId_sessionId: {
        roomId: room.id,
        sessionId,
      },
    },
    include: {
      givenAssignment: {
        include: {
          target: {
            select: {
              name: true,
              wishlist: true,
            },
          },
        },
      },
    },
  });

  if (!participant) {
    redirect(getLocalizedPath(`/room/${room.id}/join?token=${room.inviteToken}`, locale));
  }

  const isShuffled = room.shuffledAt !== null;
  const target = participant.givenAssignment?.target;
  const isAdmin = await isRoomAdmin(room.id);

  return (
    <div className="flex flex-1 items-center justify-center bg-[#0c1222]">
      <AutoRefresh />
      <main className="flex w-full max-w-md flex-col gap-8 px-6 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-6xl">{isShuffled ? "🎁" : "🎄"}</div>
          <h1 className="text-2xl font-bold text-white">
            {isShuffled ? dict.joined.titleShuffled : dict.joined.titleWaiting}
          </h1>
          <p className="text-slate-400">
            {isShuffled ? (
              <>
                {dict.joined.room}{" "}
                <span className="font-medium text-emerald-400">{room.name}</span>
              </>
            ) : (
              <>
                {dict.joined.welcomeTo}{" "}
                <span className="font-medium text-emerald-400">{room.name}</span>
              </>
            )}
          </p>
        </div>

        {isShuffled && target ? (
          <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-rose-500/10 p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-rose-500/20 ring-2 ring-amber-500/30">
                <span className="text-4xl">🎅</span>
              </div>
              <div>
                <p className="text-sm text-amber-400/80">
                  {dict.joined.youAreSantaFor}
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {target.name}
                </p>
              </div>
            </div>

            {target.wishlist && (
              <div className="mt-6 rounded-lg border border-amber-500/20 bg-slate-900/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">💝</span>
                  <p className="text-sm font-medium text-amber-400">
                    {dict.joined.wishes}
                  </p>
                </div>
                <p className="leading-relaxed text-slate-300">
                  {target.wishlist}
                </p>
              </div>
            )}

            {!target.wishlist && (
              <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/30 p-4 text-center">
                <p className="text-sm text-slate-500">
                  {dict.joined.noWishes.replace("{name}", target.name)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <span className="text-3xl">✅</span>
              </div>
              <div>
                <p className="font-medium text-white">{participant.name}</p>
                <p className="text-sm text-slate-500">{dict.joined.registered}</p>
              </div>
            </div>

            {participant.wishlist && (
              <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                <p className="mb-1 text-xs font-medium text-slate-500">
                  {dict.joined.yourWishes}
                </p>
                <p className="text-sm text-slate-300">{participant.wishlist}</p>
              </div>
            )}
          </div>
        )}

        <div className="rounded-xl border border-slate-700 bg-slate-800/20 p-4 text-center">
          <p className="text-sm text-slate-400">
            {dict.joined.participants}{" "}
            <span className="font-medium text-white">
              {room._count.participants}
            </span>
          </p>
          {!isShuffled && (
            <p className="mt-2 text-xs text-slate-500">
              {dict.joined.waitingMessage}
            </p>
          )}
        </div>

        {!isShuffled && (
          <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-rose-500/5 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏳</span>
              <div className="text-sm">
                <p className="font-medium text-amber-400/90">
                  {dict.joined.waitTitle}
                </p>
                <p className="mt-1 text-slate-400">{dict.joined.waitMessage}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {dict.joined.refreshHint}
                </p>
                {participant.email && (
                  <p className="mt-2 text-xs text-slate-500">
                    {dict.joined.emailHint.replace("{email}", participant.email)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {isShuffled && participant.wishlist && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/20 p-4">
            <p className="mb-2 text-xs font-medium text-slate-500">
              {dict.joined.yourWishesForSanta}
            </p>
            <p className="text-sm text-slate-300">{participant.wishlist}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {isAdmin && (
            <Link
              href={getLocalizedPath(`/room/${room.id}/admin`, locale)}
              className="text-center text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              👑 {dict.joined.backToAdmin}
            </Link>
          )}
          <Link
            href={getLocalizedPath("/", locale)}
            className="text-center text-sm text-slate-500 transition-colors hover:text-slate-400"
          >
            ← {dict.common.home}
          </Link>
        </div>
      </main>
    </div>
  );
}

