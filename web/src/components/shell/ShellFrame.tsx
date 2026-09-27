"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { UI } from "@/content/ui";
import { setLiveViewing, startLive } from "@/lib/liveStore";

import styles from "./Shell.module.css";

// На телефоне «/» — это список диалогов, как в мобильном Telegram; открытый диалог — /c/<id>.
export function ShellFrame({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const dialogOpen = pathname !== "/";

  // Одно WS-соединение на вкладку: Live-чат обновляет список диалогов, даже когда закрыт.
  useEffect(() => startLive(), []);
  useEffect(() => {
    // Пасхалка для тех, кто открыл консоль.
    console.log("%c◉ CHESTOR", "color:#e2203f;font:800 28px sans-serif;text-shadow:0 0 8px #e2203f");
    console.log(UI.consoleGreeting);
  }, []);
  useEffect(() => setLiveViewing(pathname === "/c/live"), [pathname]);
  return (
    <div className={styles.shell} data-dialog-open={dialogOpen}>
      <a href="#dialog" className={styles.skip}>
        {UI.skipToDialog}
      </a>
      <aside className={styles.sidebar}>{sidebar}</aside>
      <main className={styles.pane} id="dialog" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
