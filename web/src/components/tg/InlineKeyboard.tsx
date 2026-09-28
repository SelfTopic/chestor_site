import { ExternalLink } from "lucide-react";
import Link from "next/link";

import styles from "./InlineKeyboard.module.css";

export type KeyboardButton = { label: string; href: string };

export function InlineKeyboard({ rows }: { rows: readonly (readonly KeyboardButton[])[] }) {
  return (
    <div className={styles.keyboard}>
      {rows.map((row, rowIndex) => (
        <div className={styles.row} key={rowIndex}>
          {row.map((button) => {
            const external = /^https?:/.test(button.href);
            return external ? (
              <a key={button.href} href={button.href} className={styles.button} target="_blank" rel="noreferrer">
                {button.label}
                <ExternalLink size={12} className={styles.corner} aria-hidden="true" />
              </a>
            ) : (
              <Link key={button.href} href={button.href} className={styles.button}>
                {button.label}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
