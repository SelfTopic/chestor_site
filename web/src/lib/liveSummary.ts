"use client";

import { useSyncExternalStore } from "react";

export type LiveSummary = {
  unread: number;
  online: number | null;
  last: { author: string; text: string; time: string } | null;
};

const EMPTY: LiveSummary = { unread: 0, online: null, last: null };

let summary: LiveSummary = EMPTY;
const listeners = new Set<() => void>();

export function updateLiveSummary(patch: Partial<LiveSummary>): void {
  summary = { ...summary, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLiveSummary(): LiveSummary {
  return useSyncExternalStore(
    subscribe,
    () => summary,
    () => EMPTY,
  );
}
