import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "WeSanta — Тайный Санта онлайн";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0c1222",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #1e3a5f 0%, transparent 50%), radial-gradient(circle at 75% 75%, #2d1f3d 0%, transparent 50%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Декоративные снежинки */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 60,
            fontSize: 32,
            opacity: 0.3,
            display: "flex",
          }}
        >
          ❄️
        </div>
        <div
          style={{
            position: "absolute",
            top: 120,
            left: 180,
            fontSize: 24,
            opacity: 0.2,
            display: "flex",
          }}
        >
          ❄️
        </div>
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 100,
            fontSize: 28,
            opacity: 0.25,
            display: "flex",
          }}
        >
          ❄️
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: 120,
            fontSize: 20,
            opacity: 0.2,
            display: "flex",
          }}
        >
          ❄️
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 80,
            right: 150,
            fontSize: 36,
            opacity: 0.3,
            display: "flex",
          }}
        >
          ❄️
        </div>
        <div
          style={{
            position: "absolute",
            top: 200,
            right: 80,
            fontSize: 18,
            opacity: 0.15,
            display: "flex",
          }}
        >
          ✨
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 180,
            left: 80,
            fontSize: 22,
            opacity: 0.2,
            display: "flex",
          }}
        >
          ✨
        </div>

        {/* Основной контент */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Иконка Санты */}
          <div
            style={{
              fontSize: 120,
              display: "flex",
              filter: "drop-shadow(0 0 40px rgba(239, 68, 68, 0.4))",
            }}
          >
            🎅
          </div>

          {/* Название */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: "white",
                letterSpacing: "-2px",
                display: "flex",
              }}
            >
              WeSanta
            </div>
            <div
              style={{
                fontSize: 32,
                color: "#94a3b8",
                display: "flex",
              }}
            >
              Тайный Санта онлайн
            </div>
          </div>

          {/* Подзаголовок */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 16,
              padding: "12px 24px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              borderRadius: 100,
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <span style={{ fontSize: 24, display: "flex" }}>🎁</span>
            <span style={{ fontSize: 24, color: "#10b981", display: "flex" }}>
              Бесплатно и без регистрации
            </span>
          </div>
        </div>

        {/* Нижний декор */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#64748b",
            fontSize: 20,
          }}
        >
          <span style={{ display: "flex" }}>wesanta.club</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

