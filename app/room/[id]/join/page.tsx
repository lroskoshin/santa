import { prisma } from "../../../../lib/prisma";
import { notFound, redirect } from "next/navigation";
import { JoinRoomForm } from "./join-room-form";
import { cookies } from "next/headers";
import Link from "next/link";

interface JoinPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

const USER_TOKEN_COOKIE = "santa_user_token";

export default async function JoinPage({ params, searchParams }: JoinPageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token) {
    redirect("/");
  }

  const room = await prisma.room.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      inviteToken: true,
      allowWishlist: true,
      requireEmail: true,
      shuffledAt: true,
    },
  });

  if (!room || room.inviteToken !== token) {
    notFound();
  }

  // Если жеребьёвка уже проведена, показываем сообщение
  if (room.shuffledAt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c1222]">
        <main className="flex w-full max-w-md flex-col gap-6 px-6 text-center">
          <div className="text-6xl">🚫</div>
          <h1 className="text-2xl font-bold text-white">
            Регистрация закрыта
          </h1>
          <p className="text-slate-400">
            К сожалению, жеребьёвка в комнате <span className="font-medium text-emerald-400">{room.name}</span> уже 
            проведена и новые участники не могут присоединиться.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl bg-slate-700 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-600"
          >
            На главную
          </Link>
        </main>
      </div>
    );
  }

  // Check if user already joined
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(USER_TOKEN_COOKIE)?.value;

  if (sessionId) {
    const existingParticipant = await prisma.participant.findUnique({
      where: {
        roomId_sessionId: {
          roomId: room.id,
          sessionId,
        },
      },
    });

    if (existingParticipant) {
      redirect(`/room/${room.id}/joined`);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c1222]">
      <main className="flex w-full max-w-md flex-col gap-8 px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-5xl">🎁</div>
          <h1 className="text-2xl font-bold text-white">
            Присоединиться к игре
          </h1>
          <p className="text-slate-400">
            Тебя приглашают в <span className="font-medium text-emerald-400">{room.name}</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-6">
          <JoinRoomForm
            roomId={room.id}
            inviteToken={token}
            allowWishlist={room.allowWishlist}
            requireEmail={room.requireEmail}
          />
        </div>

        <p className="text-center text-xs text-slate-600">
          После присоединения ты получишь имя того, кому будешь дарить подарок
        </p>
      </main>
    </div>
  );
}

