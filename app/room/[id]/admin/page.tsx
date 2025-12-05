import { prisma } from "../../../../lib/prisma";
import { notFound, redirect } from "next/navigation";
import { CopyButton } from "./copy-button";
import { isRoomAdmin } from "../../../actions/room";

interface AdminPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { id } = await params;

  const isAdmin = await isRoomAdmin(id);

  if (!isAdmin) {
    redirect("/");
  }

  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      participants: true,
    },
  });

  if (!room) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const inviteUrl = `${baseUrl}/room/${room.id}/join?token=${room.inviteToken}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c1222]">
      <main className="flex w-full max-w-lg flex-col gap-8 px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-5xl">🎄</div>
          <h1 className="text-2xl font-bold text-white">
            {room.name}
          </h1>
          <p className="text-slate-400">
            Комната создана! Отправь ссылку участникам
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">
              Ссылка для участников
            </span>
            <CopyButton text={inviteUrl} />
          </div>
          <p className="break-all text-sm text-emerald-400">{inviteUrl}</p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-medium text-white">
              Участники ({room.participants.length})
            </span>
          </div>
          {room.participants.length === 0 ? (
            <p className="text-sm text-slate-500">
              Пока никто не присоединился
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {room.participants.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 text-slate-300"
                >
                  <span className="text-lg">👤</span>
                  {p.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {room.participants.length >= 3 && (
          <button className="h-12 w-full rounded-xl bg-red-600 font-semibold text-white transition-all hover:bg-red-500">
            🎲 Запустить распределение
          </button>
        )}

        {room.participants.length < 3 && room.participants.length > 0 && (
          <p className="text-center text-sm text-slate-500">
            Нужно минимум 3 участника для запуска
          </p>
        )}
      </main>
    </div>
  );
}

