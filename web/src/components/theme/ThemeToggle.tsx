"use client";

import { useId, useRef, useState, type MouseEvent } from "react";

import { oppositeTheme } from "@/lib/theme";

import styles from "./ThemeToggle.module.css";
import { useTheme } from "./useTheme";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => unknown;
};

const AWAKEN_MS = 900;

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const [awakening, setAwakening] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const clipId = useId();
  const next = oppositeTheme(theme);

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as ViewTransitionDocument;

    setAwakening(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAwakening(false), AWAKEN_MS);

    if (reduced || !doc.startViewTransition) {
      setTheme(next);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const root = document.documentElement.style;
    root.setProperty("--reveal-x", `${x}px`);
    root.setProperty("--reveal-y", `${y}px`);
    root.setProperty("--reveal-r", `${radius}px`);
    doc.startViewTransition(() => setTheme(next));
  }

  const label = theme === "ghoul" ? "Вернуть человеческий облик" : "Пробудить какуган";

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={theme === "ghoul"}
      data-awakening={awakening || undefined}
    >
      <svg className={styles.eye} viewBox="0 0 64 40" aria-hidden="true">
        <defs>
          <clipPath id={clipId}>
            <path d="M4 20 Q32 -6 60 20 Q32 46 4 20 Z" />
          </clipPath>
        </defs>
        <g className={styles.lid}>
          <g clipPath={`url(#${clipId})`}>
            <rect className={styles.sclera} x="0" y="0" width="64" height="40" />
            <circle className={styles.darkness} cx="32" cy="20" r="30" />
            <g className={styles.veins}>
              <path d="M23 18 Q15 14 8 17" />
              <path d="M24 23 Q16 27 10 25" />
              <path d="M41 17 Q49 12 56 16" />
              <path d="M40 24 Q48 29 55 25" />
              <path d="M30 11 Q29 6 25 4" />
              <path d="M35 29 Q37 34 41 36" />
            </g>
            <circle className={styles.iris} cx="32" cy="20" r="9.5" />
            <circle className={styles.pupil} cx="32" cy="20" r="4" />
            <circle className={styles.glint} cx="35.5" cy="16.5" r="1.8" />
          </g>
          <path className={styles.outline} d="M4 20 Q32 -6 60 20 Q32 46 4 20 Z" />
        </g>
      </svg>
    </button>
  );
}
