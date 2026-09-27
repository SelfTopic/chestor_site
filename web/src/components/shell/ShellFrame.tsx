"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { setLiveViewing, startLive } from "@/lib/liveStore";

import styles from "./Shell.module.css";

// На телефоне «/» — это список диалогов, как в мобильном Telegram; открытый диалог — /c/<id>.
export function ShellFrame({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const dialogOpen = pathname !== "/";

  // Одно WS-соединение на вкладку: Live-чат обновляет список диалогов, даже когда закрыт.
  useEffect(() => startLive(), []);
  useEffect(() => setLiveViewing(pathname === "/c/live"), [pathname]);
  return (
    <div className={styles.shell} data-dialog-open={dialogOpen}>
      <aside className={styles.sidebar}>{sidebar}</aside>
      <main className={styles.pane}>{children}</main>
    </div>
  );
}
