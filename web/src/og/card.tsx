import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

type Card = { kicker: string; title: string; subtitle: string; tag: string };

async function fonts() {
  const dir = join(process.cwd(), "src/og/fonts");
  const [display, sans] = await Promise.all([
    readFile(join(dir, "Unbounded.ttf")),
    readFile(join(dir, "Onest.ttf")),
  ]);
  return [
    { name: "Unbounded", data: display, weight: 800 as const, style: "normal" as const },
    { name: "Onest", data: sans, weight: 500 as const, style: "normal" as const },
  ];
}

// Своя картинка превью: какуган и текст, без кадров из аниме.
export async function ogImage({ kicker, title, subtitle, tag }: Card): Promise<ImageResponse> {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "radial-gradient(circle at 85% 30%, #3a0610 0%, #0e0b0c 55%)",
          color: "#f1e9ea",
          fontFamily: "Onest",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 28, color: "#ff5c75", letterSpacing: 4 }}>{kicker}</div>
          <svg width="150" height="94" viewBox="0 0 64 40">
            <path d="M4 20 Q32 -6 60 20 Q32 46 4 20 Z" fill="#050304" stroke="#e2203f" strokeWidth="2.5" />
            <path d="M23 18 Q15 14 8 17M24 23 Q16 27 10 25M41 17 Q49 12 56 16M40 24 Q48 29 55 25" stroke="#ff2448" strokeWidth="1.3" fill="none" />
            <circle cx="32" cy="20" r="9.5" fill="#ff1f3d" />
            <ellipse cx="32" cy="20" rx="2.2" ry="4.4" fill="#120003" />
            <circle cx="35.5" cy="16.5" r="1.8" fill="rgba(255,255,255,0.85)" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontFamily: "Unbounded", fontSize: 104, lineHeight: 1, color: "#ffffff" }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 38, lineHeight: 1.3, color: "#d9c9cc", maxWidth: 940 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 26 }}>
          <div style={{ display: "flex", color: "#a19295" }}>chestor.site</div>
          <div
            style={{
              display: "flex",
              padding: "8px 20px",
              border: "3px solid #ff1f45",
              borderRadius: 10,
              color: "#ff1f45",
              fontFamily: "Unbounded",
            }}
          >
            {tag}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
