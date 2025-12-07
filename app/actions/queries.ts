import { prisma } from "../../lib/prisma";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
import { USER_TOKEN_COOKIE, type UserRoom } from "./types";

export const getTotalRoomsCount = unstable_cache(
  async () => {
    const count = await prisma.room.count();
    return count;
  },
  ["total-rooms-count"],
  { revalidate: 60 }
);

export async function getUserRooms(): Promise<UserRoom[]> {
  const cookieStore = await cookies();
  const userToken = cookieStore.get(USER_TOKEN_COOKIE)?.value;

  if (!userToken) {
    return [];
  }

  const adminRooms = await prisma.room.findMany({
    where: {
      adminToken: userToken,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      shuffledAt: true,
      _count: {
        select: {
          participants: true,
        },
      },
    },
  });

  const participantRooms = await prisma.room.findMany({
    where: {
      participants: {
        some: {
          sessionId: userToken,
        },
      },
      NOT: {
        adminToken: userToken,
      },
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      shuffledAt: true,
      _count: {
        select: {
          participants: true,
        },
      },
    },
  });

  const allRooms: UserRoom[] = [
    ...adminRooms.map((room) => ({
      id: room.id,
      name: room.name,
      createdAt: room.createdAt,
      isAdmin: true,
      shuffledAt: room.shuffledAt,
      participantsCount: room._count.participants,
    })),
    ...participantRooms.map((room) => ({
      id: room.id,
      name: room.name,
      createdAt: room.createdAt,
      isAdmin: false,
      shuffledAt: room.shuffledAt,
      participantsCount: room._count.participants,
    })),
  ];

  return allRooms.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function isRoomAdmin(roomId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const userToken = cookieStore.get(USER_TOKEN_COOKIE)?.value;

  if (!userToken) {
    return false;
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { adminToken: true },
  });

  if (!room) {
    return false;
  }

  return room.adminToken === userToken;
}
