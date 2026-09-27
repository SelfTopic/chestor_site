"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import { isTheme, THEME_COLOR, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

const THEME_EVENT = "chestor:theme";

function readTheme(): Theme {
  const value = document.documentElement.getAttribute("data-theme");
  return isTheme(value) ? value : "human";
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

function applyTheme(theme: Theme, persist: boolean): void {
  document.documentElement.setAttribute("data-theme", theme);
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute("content", THEME_COLOR[theme]));
  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Приватный режим Safari: тема просто не запомнится.
    }
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

function hasStoredChoice(): boolean {
  try {
    return isTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return false;
  }
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "human" as const);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const follow = () => {
      if (!hasStoredChoice()) applyTheme(media.matches ? "ghoul" : "human", false);
    };
    media.addEventListener("change", follow);
    return () => media.removeEventListener("change", follow);
  }, []);

  const setTheme = useCallback((next: Theme) => applyTheme(next, true), []);
  return [theme, setTheme];
}
