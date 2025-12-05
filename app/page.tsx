import { CreateRoomForm } from "./components/create-room-form";
import { getUserRooms } from "./actions/room";
import Link from "next/link";

export default async function Home() {
  const userRooms = await getUserRooms();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c1222]">
      <main className="flex w-full max-w-md flex-col items-center gap-12 px-6 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-6xl">🎅</div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Тайный Санта
          </h1>
          <p className="text-lg text-slate-400">
            Создай комнату и пригласи друзей
          </p>
        </div>

        <CreateRoomForm />

        <p className="text-sm text-slate-500">
          Каждый участник узнает, кому он дарит подарок 🎁
        </p>

        {userRooms.length > 0 && (
          <div className="w-full">
            <h2 className="mb-4 text-lg font-semibold text-slate-300">
              Твои комнаты
            </h2>
            <ul className="flex flex-col gap-3">
              {userRooms.map((room) => (
                <li key={room.id}>
                  <Link
                    href={`/room/${room.id}/admin?token=${room.adminToken}`}
                    className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition-all hover:border-slate-600 hover:bg-slate-800"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-white">{room.name}</span>
                      <span className="text-sm text-slate-500">
                        {room._count.participants} участник(ов)
                      </span>
                    </div>
                    <span className="text-slate-500">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
