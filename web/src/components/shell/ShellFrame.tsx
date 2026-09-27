"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import styles from "./Shell.module.css";

// На телефоне «/» — это список диалогов, как в мобильном Telegram; открытый диалог — /c/<id>.
export function ShellFrame({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const dialogOpen = pathname !== "/";
  return (
    <div className={styles.shell} data-dialog-open={dialogOpen}>
      <aside className={styles.sidebar}>{sidebar}</aside>
      <main className={styles.pane}>{children}</main>
    </div>
  );
}
