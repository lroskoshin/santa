import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { isRoomAdmin } from "@/app/actions/queries";
import { MAX_PARTICIPANTS } from "@/lib/constants";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";
import { getDictionary } from "../../../dictionaries";
import { getLocalizedPath, type Locale } from "@/lib/i18n";

const USER_TOKEN_COOKIE = "santa_user_token";

// Lazy load client components
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

import { JoinAsAdminButton } from "./join-as-admin-button";
import { AutoRefresh } from "@/components/auto-refresh";

const ResendButton = dynamic(() =>
  import("./resend-button").then((m) => ({ default: m.ResendButton }))
);

interface AdminPageProps {
  params: Promise<{ id: string; locale: Locale }>;
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { id, locale } = await params;
  const dict = await getDictionary(locale);

  const isAdmin = await isRoomAdmin(id);

  if (!isAdmin) {
    redirect(getLocalizedPath("/", locale));
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(USER_TOKEN_COOKIE)?.value;

  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      participants: {
        select: {
          id: true,
          name: true,
          email: true,
          sessionId: true,
          notificationsSent: true,
        },
      },
    },
  });

  if (!room) {
    notFound();
  }

  // Check if admin is a participant
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
  const inviteUrl = `${baseUrl}${getLocalizedPath(`/room/${room.id}/join?token=${room.inviteToken}`, locale)}`;

  return (
    <div className="flex flex-1 items-center justify-center bg-[#0c1222]">
      <AutoRefresh />
      <main className="flex w-full max-w-lg flex-col gap-8 px-6 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-5xl">🎄</div>
          <h1 className="text-2xl font-bold text-white">{room.name}</h1>
          <p className="text-slate-400">
            {room.shuffledAt ? dict.admin.shuffleCompleted : dict.admin.created}
          </p>
        </div>

        {/* Admin's draw result block */}
        {room.shuffledAt && isAdminParticipant && adminTarget && (
          <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-rose-500/10 p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-rose-500/20 ring-2 ring-amber-500/30">
                <span className="text-4xl">🎅</span>
              </div>
              <div>
                <p className="text-sm text-amber-400/80">
                  {dict.admin.youAreSantaFor}
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
                    {dict.admin.wishes}
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
                  {dict.admin.noWishes.replace("{name}", adminTarget.name)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Notice that admin is participating but draw not done yet */}
        {!room.shuffledAt && isAdminParticipant && adminParticipant && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                <span className="text-xl">✅</span>
              </div>
              <div>
                <p className="font-medium text-emerald-400">
                  {dict.admin.participatingAs.replace(
                    "{name}",
                    adminParticipant.name
                  )}
                </p>
                <p className="text-sm text-slate-400">
                  {dict.admin.runShuffleHint}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">
              {dict.admin.inviteLink}
            </span>
            <CopyButton text={inviteUrl} dictionary={dict.copyButton} />
          </div>
          <p className="break-all text-sm text-emerald-400">{inviteUrl}</p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-medium text-white">
              {dict.admin.participants} ({room.participants.length})
            </span>
            <span
              className={`text-xs ${
                room.participants.length >= MAX_PARTICIPANTS
                  ? "text-red-400"
                  : room.participants.length >= MAX_PARTICIPANTS * 0.8
                    ? "text-amber-400"
                    : "text-slate-500"
              }`}
            >
              {dict.common.max} {MAX_PARTICIPANTS}
            </span>
          </div>

          {/* Progress bar for participant limit */}
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className={`h-full transition-all ${
                room.participants.length >= MAX_PARTICIPANTS
                  ? "bg-red-500"
                  : room.participants.length >= MAX_PARTICIPANTS * 0.8
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              style={{
                width: `${Math.min((room.participants.length / MAX_PARTICIPANTS) * 100, 100)}%`,
              }}
            />
          </div>

          {room.participants.length === 0 ? (
            <p className="text-sm text-slate-500">{dict.admin.noParticipants}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {room.participants.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-slate-800/50 px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-lg">
                      {p.sessionId === sessionId ? "🎅" : "👤"}
                    </span>
                    <span className="truncate">{p.name}</span>
                    {p.sessionId === sessionId && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                        {dict.common.you}
                      </span>
                    )}
                    {p.email && (
                      <span
                        className="text-slate-500"
                        title={`Email: ${p.email}`}
                      >
                        📧
                      </span>
                    )}
                  </div>

                  {/* Resend button - only show after shuffle */}
                  {room.shuffledAt && (
                    <ResendButton
                      roomId={room.id}
                      participantId={p.id}
                      participantName={p.name}
                      notificationsSent={p.notificationsSent}
                      hasEmail={!!p.email}
                      dictionary={dict.resendButton}
                      locale={locale}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* "Join as participant" button for admin */}
        {!room.shuffledAt && !isAdminParticipant && (
          <JoinAsAdminButton inviteUrl={inviteUrl} dictionary={dict.admin} />
        )}

        <ShuffleButton
          roomId={room.id}
          isShuffled={!!room.shuffledAt}
          participantsCount={room.participants.length}
          dictionary={dict.shuffleButton}
          locale={locale}
        />
      </main>
    </div>
  );
}

