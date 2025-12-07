import { getUserRooms } from "../actions/queries";
import Link from "next/link";

export async function UserRooms() {
  const userRooms = await getUserRooms();

  if (userRooms.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <h2 className="mb-4 text-lg font-semibold text-slate-300">
        Твои комнаты
      </h2>
      <ul className="flex flex-col gap-3">
        {userRooms.map((room) => (
          <li key={room.id}>
            <Link
              href={room.isAdmin ? `/room/${room.id}/admin` : `/room/${room.id}/joined`}
              className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition-all hover:border-slate-600 hover:bg-slate-800"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{room.name}</span>
                  {room.isAdmin && (
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-medium text-amber-400">
                      👑 Организатор
                    </span>
                  )}
                  {room.shuffledAt && (
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-xs font-medium text-emerald-400">
                      ✓ Распределено
                    </span>
                  )}
                </div>
                <span className="text-sm text-slate-500">
                  {room.participantsCount} участник(ов)
                </span>
              </div>
              <span className="text-slate-500">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function UserRoomsSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="mb-4 h-6 w-32 rounded bg-slate-700" />
      <div className="flex flex-col gap-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4"
          >
            <div className="flex flex-col gap-2">
              <div className="h-5 w-40 rounded bg-slate-700" />
              <div className="h-4 w-24 rounded bg-slate-700/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

