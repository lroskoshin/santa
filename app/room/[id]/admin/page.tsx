import { prisma } from "../../../../lib/prisma";
import { notFound, redirect } from "next/navigation";
import { isRoomAdmin } from "../../../actions/queries";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";

const USER_TOKEN_COOKIE = "santa_user_token";

// Lazy load client components - они разбиваются на отдельные чанки
const CopyButton = dynamic(() =>
  import("./copy-button").then((m) => ({ default: m.CopyButton }))
);

const ShuffleButton = dynamic(
  () => import("./shuffle-button").then((m) => ({ default: m.ShuffleButton })),
  {
    loading: () => (
      <div className="h-12 w-full animate-pulse rounded-xl bg-slate-700" />
    ),
  }
);


const JoinAsAdminButton = dynamic(() =>
  import("./join-as-admin-button").then((m) => ({
    default: m.JoinAsAdminButton,
  }))
);

interface AdminPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { id } = await params;

  const isAdmin = await isRoomAdmin(id);

  if (!isAdmin) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(USER_TOKEN_COOKIE)?.value;

  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      participants: true,
    },
  });

  if (!room) {
    notFound();
  }

  // Проверяем, является ли админ участником
  const adminParticipant = sessionId
    ? await prisma.participant.findUnique({
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
      })
    : null;

  const isAdminParticipant = !!adminParticipant;
  const adminTarget = adminParticipant?.givenAssignment?.target;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const inviteUrl = `${baseUrl}/room/${room.id}/join?token=${room.inviteToken}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c1222]">
      <main className="flex w-full max-w-lg flex-col gap-8 px-6 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-5xl">🎄</div>
          <h1 className="text-2xl font-bold text-white">{room.name}</h1>
          <p className="text-slate-400">
            {room.shuffledAt
              ? "Жеребьёвка завершена!"
              : "Комната создана! Отправь ссылку участникам"}
          </p>
        </div>

        {/* Блок результата жеребьёвки для админа-участника */}
        {room.shuffledAt && isAdminParticipant && adminTarget && (
          <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-rose-500/10 p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-rose-500/20 ring-2 ring-amber-500/30">
                <span className="text-4xl">🎅</span>
              </div>
              <div>
                <p className="text-sm text-amber-400/80">
                  Ты — Тайный Санта для:
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {adminTarget.name}
                </p>
              </div>
            </div>

            {adminTarget.wishlist && (
              <div className="mt-6 rounded-lg border border-amber-500/20 bg-slate-900/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">💝</span>
                  <p className="text-sm font-medium text-amber-400">
                    Пожелания:
                  </p>
                </div>
                <p className="leading-relaxed text-slate-300">
                  {adminTarget.wishlist}
                </p>
              </div>
            )}

            {!adminTarget.wishlist && (
              <div className="mt-6 rounded-lg border border-slate-700 bg-slate-800/30 p-4 text-center">
                <p className="text-sm text-slate-500">
                  {adminTarget.name} не оставил(а) пожеланий — придётся удивить!
                  🎉
                </p>
              </div>
            )}
          </div>
        )}

        {/* Уведомление что админ участвует но шаффл не проведён */}
        {!room.shuffledAt && isAdminParticipant && adminParticipant && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                <span className="text-xl">✅</span>
              </div>
              <div>
                <p className="font-medium text-emerald-400">
                  Вы участвуете как {adminParticipant.name}
                </p>
                <p className="text-sm text-slate-400">
                  Запустите жеребьёвку, чтобы узнать кому дарить подарок
                </p>
              </div>
            </div>
          </div>
        )}

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
                  <span className="text-lg">
                    {p.sessionId === sessionId ? "🎅" : "👤"}
                  </span>
                  {p.name}
                  {p.sessionId === sessionId && (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                      вы
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

        </div>

        {/* Кнопка "Принять участие" для админа */}
        {!room.shuffledAt && !isAdminParticipant && (
          <JoinAsAdminButton
            roomId={room.id}
            allowWishlist={room.allowWishlist}
            isShuffled={!!room.shuffledAt}
          />
        )}

        <ShuffleButton
          roomId={room.id}
          isShuffled={!!room.shuffledAt}
          participantsCount={room.participants.length}
        />
      </main>
    </div>
  );
}

