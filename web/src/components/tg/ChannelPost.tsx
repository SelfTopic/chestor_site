import type { ReactNode } from "react";

import { Avatar, type AvatarGlyph } from "./Avatar";
import styles from "./ChannelPost.module.css";

type ChannelPostProps = {
  channel: string;
  glyph: AvatarGlyph;
  time?: string;
  badge?: ReactNode;
  footer?: ReactNode;
  id?: string;
  children: ReactNode;
};

export function ChannelPost({ channel, glyph, time, badge, footer, id, children }: ChannelPostProps) {
  return (
    <article className={styles.post} id={id}>
      <div className={styles.side}>
        <Avatar glyph={glyph} size={34} />
      </div>
      <div className={styles.card}>
        <header className={styles.header}>
          <span className={styles.channel}>{channel}</span>
          {badge}
        </header>
        <div className={styles.body}>{children}</div>
        {footer || time ? (
          <footer className={styles.footer}>
            <div className={styles.footerContent}>{footer}</div>
            {time ? <time className={styles.time}>{time}</time> : null}
          </footer>
        ) : null}
      </div>
    </article>
  );
}
