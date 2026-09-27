import type { ReactNode } from "react";

import styles from "./ChatArea.module.css";

export function ChatArea({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className={styles.area}>
      <div className={styles.scroll} role="log" aria-label={label} tabIndex={0}>
        <div className={styles.column}>{children}</div>
      </div>
    </div>
  );
}
