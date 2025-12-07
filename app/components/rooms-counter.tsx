import { getTotalRoomsCount } from "../actions/queries";

export async function RoomsCounter() {
  const totalRooms = await getTotalRoomsCount();

  if (totalRooms === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
      <span className="text-2xl">✨</span>
      <p className="text-sm text-emerald-400">
        Уже создано <span className="font-bold">{totalRooms}</span>{" "}
        {totalRooms === 1 ? "комната" : totalRooms < 5 ? "комнаты" : "комнат"}!
      </p>
    </div>
  );
}

export function RoomsCounterSkeleton() {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 px-4 py-3 animate-pulse">
      <div className="w-8 h-8 rounded bg-emerald-500/10" />
      <div className="h-4 w-40 rounded bg-emerald-500/10" />
    </div>
  );
}

