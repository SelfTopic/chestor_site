"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "chestor-nick";
const EVENT = "chestor:nick";

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function useStoredNick(): [string, (nick: string) => void] {
  const nick = useSyncExternalStore(subscribe, read, () => "");
  const save = useCallback((value: string) => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      // Приватный режим: ник проживёт до перезагрузки только в форме.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [nick, save];
}
