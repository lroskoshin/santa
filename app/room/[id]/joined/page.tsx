import { prisma } from "../../../../lib/prisma";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";

interface JoinedPageProps {
  params: Promise<{ id: string }>;
}

const USER_TOKEN_COOKIE = "santa_user_token";

export default async function JoinedPage({ params }: JoinedPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(USER_TOKEN_COOKIE)?.value;

  if (!sessionId) {
    redirect("/");
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
    redirect(`/room/${room.id}/join?token=${room.inviteToken}`);
  }

  const isShuffled = room.shuffledAt !== null;
  const target = participant.givenAssignment?.target;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c1222]">
      <main className="flex w-full max-w-md flex-col gap-8 px-6 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-6xl">{isShuffled ? "🎁" : "🎄"}</div>
          <h1 className="text-2xl font-bold text-white">
            {isShuffled ? "Жеребьёвка завершена!" : "Ты в игре!"}
          </h1>
          <p className="text-slate-400">
            {isShuffled ? (
              <>Комната <span className="font-medium text-emerald-400">{room.name}</span></>
            ) : (
              <>Добро пожаловать в <span className="font-medium text-emerald-400">{room.name}</span></>
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
                <p className="text-sm text-amber-400/80">Ты — Тайный Санта для:</p>
                <p className="mt-1 text-2xl font-bold text-white">{target.name}</p>
              </div>
            </div>

            {target.wishlist && (
              <div className="mt-6 rounded-lg border border-amber-500/20 bg-slate-900/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">💝</span>
                  <p className="text-sm font-medium text-amber-400">Пожелания:</p>
                </div>
                <p className="text-slate-300 leading-relaxed">{target.wishlist}</p>
              </div>
            )}

            {!target.wishlist && (
              <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/30 p-4 text-center">
                <p className="text-sm text-slate-500">
                  {target.name} не оставил(а) пожеланий — придётся удивить! 🎉
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
                <p className="text-sm text-slate-500">Участник зарегистрирован</p>
              </div>
            </div>

            {participant.wishlist && (
              <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                <p className="mb-1 text-xs font-medium text-slate-500">Твои пожелания:</p>
                <p className="text-sm text-slate-300">{participant.wishlist}</p>
              </div>
            )}
          </div>
        )}

        <div className="rounded-xl border border-slate-700 bg-slate-800/20 p-4 text-center">
          <p className="text-sm text-slate-400">
            Участников: <span className="font-medium text-white">{room._count.participants}</span>
          </p>
          {!isShuffled && (
            <p className="mt-2 text-xs text-slate-500">
              Когда все соберутся, организатор запустит распределение, и ты узнаешь, кому дарить подарок 🎁
            </p>
          )}
        </div>

        {isShuffled && participant.wishlist && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/20 p-4">
            <p className="mb-2 text-xs font-medium text-slate-500">Твои пожелания для Санты:</p>
            <p className="text-sm text-slate-300">{participant.wishlist}</p>
          </div>
        )}

        <Link
          href="/"
          className="text-center text-sm text-slate-500 transition-colors hover:text-slate-400"
        >
          ← На главную
        </Link>
      </main>
    </div>
  );
}

