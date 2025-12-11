import { connection } from "next/server";
import { getTotalRoomsCount } from "@/app/actions/queries";
import type { getDictionary } from "../dictionaries";

interface RoomsCounterProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["roomsCounter"];
}

export async function RoomsCounter({ dictionary }: RoomsCounterProps) {
  // Don't pre-render at build time — wait for real request
  await connection();
  const totalRooms = await getTotalRoomsCount();

  if (totalRooms === 0) {
    return null;
  }

  // Pluralization
  function getRoomWord(count: number): string {
    if (count === 1) return dictionary.room_one;
    if (count >= 2 && count <= 4) return dictionary.room_few;
    return dictionary.room_many;
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
      <span className="text-2xl">✨</span>
      <p className="text-sm text-emerald-400">
        {dictionary.created} <span className="font-bold">{totalRooms}</span>{" "}
        {getRoomWord(totalRooms)}!
      </p>
    </div>
  );
}

export function RoomsCounterSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3">
      <div className="h-8 w-8 rounded bg-emerald-500/10" />
      <div className="h-4 w-40 rounded bg-emerald-500/10" />
    </div>
  );
}
