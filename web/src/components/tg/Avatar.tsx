import type { ReactNode } from "react";

import styles from "./Avatar.module.css";

export type AvatarGlyph = "self" | "projects" | "live" | "checkpoint" | "bot" | "selfrotgram";

type AvatarProps = { size?: number; online?: boolean } & (
  | { glyph: AvatarGlyph; name?: never }
  | { name: string; glyph?: never }
);

const PALETTE_SIZE = 7;

export function paletteIndex(name: string): number {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.codePointAt(0)!) >>> 0;
  return hash % PALETTE_SIZE;
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0]!, words[1]!] : [words[0] ?? "?"];
  return letters
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase();
}

const GLYPH_TONE: Record<AvatarGlyph, number> = {
  self: 0,
  projects: 1,
  live: 2,
  checkpoint: 3,
  bot: 4,
  selfrotgram: 5,
};

export function Avatar({ size = 48, online, ...who }: AvatarProps) {
  const tone = who.glyph ? GLYPH_TONE[who.glyph] : paletteIndex(who.name);
  return (
    <span
      className={styles.avatar}
      data-tone={tone}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {who.glyph ? <Glyph glyph={who.glyph} /> : initials(who.name)}
      {online ? <span className={styles.online} /> : null}
    </span>
  );
}

function Glyph({ glyph }: { glyph: AvatarGlyph }): ReactNode {
  switch (glyph) {
    case "self":
      // Монограмма S с разрезом: наполовину человек, наполовину код.
      return (
        <svg viewBox="0 0 48 48" className={styles.glyph}>
          <path
            d="M31 15.5c-1.6-2.4-4.3-3.5-7.4-3.5-4.4 0-7.6 2.4-7.6 6 0 8 15.6 4.4 15.6 12.3 0 3.8-3.5 6.2-8.2 6.2-3.5 0-6.5-1.4-8.1-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M34 9 14 39" stroke="var(--avatar-slash)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "projects":
      return (
        <svg viewBox="0 0 48 48" className={styles.glyph}>
          <rect x="11" y="17" width="26" height="19" rx="3" fill="currentColor" opacity="0.55" />
          <rect x="14" y="13" width="26" height="19" rx="3" fill="currentColor" opacity="0.8" />
          <rect x="8" y="21" width="26" height="19" rx="3" fill="currentColor" />
          <text x="21" y="35" textAnchor="middle" className={styles.rank}>
            S
          </text>
        </svg>
      );
    case "live":
      return (
        <svg viewBox="0 0 48 48" className={styles.glyph}>
          <path d="M9 13h21a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H18l-6 5v-5h-3a4 4 0 0 1-4-4V17a4 4 0 0 1 4-4Z" fill="currentColor" />
          <path d="M37 19h2a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-2v4l-5-4h-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="12.5" cy="22" r="2" fill="var(--avatar-ink)" />
          <circle cx="19.5" cy="22" r="2" fill="var(--avatar-ink)" />
          <circle cx="26.5" cy="22" r="2" fill="var(--avatar-ink)" />
        </svg>
      );
    case "checkpoint":
      // Жетон CCG: щит с прорезью, как у досье следователя.
      return (
        <svg viewBox="0 0 48 48" className={styles.glyph}>
          <path d="M24 7 38 12v11c0 9-6 15-14 18-8-3-14-9-14-18V12Z" fill="currentColor" />
          <path d="M17 22h14M17 28h9" stroke="var(--avatar-ink)" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "bot":
      // Четыре отростка ринкаку из одной точки.
      return (
        <svg viewBox="0 0 48 48" className={styles.glyph} fill="none" stroke="currentColor" strokeLinecap="round">
          <path d="M20 34c-6-2-9-8-7-15 1-4 4-7 7-8" strokeWidth="4" />
          <path d="M22 34c-1-7 2-13 9-17 3-2 6-2 8-1" strokeWidth="3.5" />
          <path d="M24 35c4-4 10-5 14-2 2 1 3 3 3 5" strokeWidth="3" />
          <path d="M21 35c-5 1-9 0-12-3" strokeWidth="2.5" />
          <circle cx="22" cy="36" r="3.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "selfrotgram":
      return (
        <svg viewBox="0 0 48 48" className={styles.glyph}>
          <path d="M8 23 38 11 33 38 24 30 19 36 18 28Z" fill="currentColor" />
          <path d="M18 28 36 14" stroke="var(--avatar-ink)" strokeWidth="2" />
          <text x="40" y="44" textAnchor="middle" className={styles.typeTag}>
            T
          </text>
        </svg>
      );
  }
}
