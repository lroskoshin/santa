"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface AutoRefreshProps {
  intervalMs?: number;
}

export function AutoRefresh({ intervalMs = 2 * 60 * 1000 }: AutoRefreshProps) {
  const router = useRouter();
  const lastRefreshRef = useRef<number>(Date.now());

  useEffect(() => {
    const refresh = () => {
      router.refresh();
      lastRefreshRef.current = Date.now();
    };

    // Интервал каждые 2 минуты
    const interval = setInterval(refresh, intervalMs);

    // На фокус окна (с debounce — не чаще раза в 10 секунд)
    const onFocus = () => {
      const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
      if (timeSinceLastRefresh > 10_000) {
        refresh();
      }
    };

    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [router, intervalMs]);

  return null;
}
