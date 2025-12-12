import Link from "next/link";
import { Snowflakes } from "@/components/snowflakes";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden">
      {/* Animated snowflakes */}
      <Snowflakes />

      {/* Aurora background effect */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -left-40 top-0 h-96 w-96 animate-pulse rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 animate-pulse rounded-full bg-blue-500/20 blur-3xl" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 animate-pulse rounded-full bg-purple-500/10 blur-3xl" style={{ animationDelay: "2s" }} />
      </div>

      <main className="relative z-10 flex flex-col items-center gap-8 px-6 py-12 text-center">
        {/* Lost Santa illustration */}
        <div className="relative">
          <div className="absolute -inset-4 animate-pulse rounded-full bg-red-500/10 blur-2xl" />
          <div className="relative text-8xl drop-shadow-2xl transition-transform hover:scale-110 md:text-9xl" style={{ filter: "drop-shadow(0 0 40px rgba(239, 68, 68, 0.3))" }}>
            🎅
          </div>
          {/* Question marks */}
          <span className="absolute -right-4 -top-4 animate-bounce text-3xl" style={{ animationDelay: "0.1s" }}>❓</span>
          <span className="absolute -left-6 top-0 animate-bounce text-2xl" style={{ animationDelay: "0.3s" }}>❓</span>
        </div>

        {/* 404 text */}
        <div className="relative">
          <h1 className="bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-8xl font-black tracking-tighter text-transparent md:text-9xl">
            404
          </h1>
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-8xl font-black tracking-tighter text-transparent blur-2xl md:text-9xl" style={{ opacity: 0.5 }}>
            404
          </div>
        </div>

        {/* Message */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Santa got lost...
          </h2>
          <p className="max-w-md text-lg text-slate-400">
            The page you&apos;re looking for got lost in the snowstorm
          </p>
        </div>

        {/* Back home button */}
        <Link
          href="/"
          className="group relative mt-4 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40"
        >
          <span className="relative z-10 flex items-center gap-2">
            <span>🏠</span>
            <span>Back to home</span>
          </span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        </Link>

        {/* Decorative elements */}
        <div className="mt-8 flex gap-4 text-3xl opacity-60">
          <span className="animate-bounce" style={{ animationDelay: "0s" }}>🎄</span>
          <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>🎁</span>
          <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>⭐</span>
          <span className="animate-bounce" style={{ animationDelay: "0.6s" }}>🎁</span>
          <span className="animate-bounce" style={{ animationDelay: "0.8s" }}>🎄</span>
        </div>
      </main>
    </div>
  );
}

