"use client";

import { useEffect, useState } from "react";

interface Snowflake {
  id: number;
  left: number;
  fontSize: number;
  delay: number;
  duration: number;
}

export function Snowflakes() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const flakes = [...Array(30)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      fontSize: 8 + Math.random() * 16,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 10,
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute animate-fall text-white/20"
          style={{
            left: `${flake.left}%`,
            top: `-20px`,
            fontSize: `${flake.fontSize}px`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}

