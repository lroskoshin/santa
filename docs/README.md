# Secret Santa Generator — Project Spec (MVP)

Tech Stack
	•	Next.js (App Router)
	•	TailwindCSS
	•	Prisma
	•	PostgreSQL
	•	No Redis
	•	Anonymous users via httpOnly cookie

⸻

## Core Idea

Пользователи создают комнату → получают ссылку для приглашения → участники сами заполняют форму → админ запускает шафл → каждому участнику назначается “кого он тянет”.

``
model Room {
  id             String        @id @default(cuid())
  name           String
  allowWishlist  Boolean       @default(true)
  inviteToken    String        @unique
  adminToken     String        @unique
  createdAt      DateTime      @default(now())
  participants   Participant[]
  assignments    Assignment[]
}

model Participant {
  id          String    @id @default(cuid())
  roomId      String
  room        Room      @relation(fields: [roomId], references: [id])
  name        String
  email       String?
  wishlist    String?
  sessionId   String?   // anonymous user identifier from cookie

  @@unique([roomId, sessionId])
}

model Assignment {
  id         String   @id @default(cuid())
  roomId     String
  santaId    String
  targetId   String
  createdAt  DateTime @default(now())
}
``
## Anonymous Auth (Cookie)
	•	Генерируем sessionId при первом заходе.
	•	Пишем в httpOnly cookie: ss_session.
	•	Используем sessionId для уникальности участника в комнате.
	•	Реализация:

``
// lib/session.ts
import { cookies } from "next/headers";
import { nanoid } from "nanoid";

export function getOrCreateSessionId() {
  const cookieStore = cookies();
  const existing = cookieStore.get("ss_session");
  if (existing?.value) return existing.value;

  const id = nanoid(16);
  cookieStore.set("ss_session", id, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
  return id;
}
``

## API Logic (via Server Actions or Route Handlers)

Create Room
	•	Input: name, allowWishlist
	•	Generate:
	•	inviteToken (10 chars)
	•	adminToken (16 chars)
	•	Output:
	•	inviteUrl
	•	adminUrl

Get Room (public)

Return:
	•	room name
	•	participants list
	•	allowWishlist

Join Room
	•	Use sessionId from cookie
	•	Create participant (or skip if already exists)

Shuffle (admin only)
	•	Validate adminToken
	•	Validate participants count ≥ 3
	•	Shuffle array → create circular assignments
	•	Save assignments