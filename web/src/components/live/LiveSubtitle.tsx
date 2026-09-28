"use client";

import { LIVE_TEXT } from "@/content/live";
import { useLive } from "@/lib/liveStore";

export function LiveSubtitle() {
  const live = useLive();
  if (live.status !== "online") return <>{live.status === "offline" ? LIVE_TEXT.offline : LIVE_TEXT.connecting}</>;
  const online = live.online ?? 0;
  return (
    <>
      группа · {online} на сайте{live.mode === "mock" ? " · демо" : " · синхронно с Telegram"}
    </>
  );
}
