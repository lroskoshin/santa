import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { JoinRoomForm } from "./join-room-form";
import { cookies } from "next/headers";
import Link from "next/link";
import { getDictionary } from "../../../dictionaries";
import { getLocalizedPath, type Locale } from "@/lib/i18n";
import type { Metadata } from "next";

interface JoinPageProps {
  params: Promise<{ id: string; locale: Locale }>;
  searchParams: Promise<{ token?: string }>;
}

const USER_TOKEN_COOKIE = "santa_user_token";

const metadataTexts = {
  ru: {
    title: (name: string) => `${name} — Присоединиться`,
    description: (name: string) =>
      `Присоединяйся к игре «${name}» в Тайного Санту! Бесплатно и без регистрации.`,
  },
  en: {
    title: (name: string) => `${name} — Join`,
    description: (name: string) =>
      `Join the Secret Santa game "${name}"! Free and no registration required.`,
  },
};

export async function generateMetadata({
  params,
}: JoinPageProps): Promise<Metadata> {
  const { id } = await params;

  const room = await prisma.room.findUnique({
    where: { id },
    select: { name: true, locale: true },
  });

  if (!room) {
    return { title: "Room not found" };
  }

  const locale = (room.locale as Locale) || "ru";
  const texts = metadataTexts[locale];

  return {
    title: texts.title(room.name),
    description: texts.description(room.name),
  };
}

export default async function JoinPage({ params, searchParams }: JoinPageProps) {
  const { id, locale } = await params;
  const { token } = await searchParams;
  const dict = await getDictionary(locale);

  if (!token) {
    redirect(getLocalizedPath("/", locale));
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

  // If draw is already complete, show message
  if (room.shuffledAt) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <main className="flex w-full max-w-md flex-col gap-6 px-6 text-center">
          <div className="text-6xl">🚫</div>
          <h1 className="text-2xl font-bold text-white">{dict.join.closed}</h1>
          <p className="text-slate-400">
            {dict.join.closedMessage.replace("{roomName}", room.name)}
          </p>
          <Link
            href={getLocalizedPath("/", locale)}
            className="mt-4 inline-block rounded-xl bg-slate-700 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-600"
          >
            {dict.common.home}
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
      redirect(getLocalizedPath(`/room/${room.id}/joined`, locale));
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <main className="flex w-full max-w-md flex-col gap-8 px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-5xl">🎁</div>
          <h1 className="text-2xl font-bold text-white">{dict.join.title}</h1>
          <p className="text-slate-400">
            {dict.join.invitedTo}{" "}
            <span className="font-medium text-emerald-400">{room.name}</span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-6">
          <JoinRoomForm
            roomId={room.id}
            inviteToken={token}
            allowWishlist={room.allowWishlist}
            requireEmail={room.requireEmail}
            dictionary={dict.join}
            locale={locale}
          />
        </div>

        <p className="text-center text-xs text-slate-600">{dict.join.footer}</p>
      </main>
    </div>
  );
}

