import { CreateRoomForm } from "./components/create-room-form";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c1222]">
      <main className="flex w-full max-w-md flex-col items-center gap-12 px-6">
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
      </main>
    </div>
  );
}
