import { CheckCheck } from "lucide-react";
import type { ReactNode } from "react";

import { paletteIndex } from "./Avatar";
import styles from "./MessageBubble.module.css";

export type Quote = { author: string; text: string };

type MessageBubbleProps = {
  direction: "in" | "out";
  time?: string;
  author?: string;
  quote?: Quote;
  tail?: boolean;
  read?: boolean;
  wide?: boolean;
  children: ReactNode;
};

export function MessageBubble({
  direction,
  time,
  author,
  quote,
  tail = true,
  read,
  wide,
  children,
}: MessageBubbleProps) {
  return (
    <div className={styles.row} data-direction={direction}>
      <div className={styles.bubble} data-tail={tail || undefined} data-wide={wide || undefined}>
        {author ? (
          <div className={styles.author} data-tone={paletteIndex(author)}>
            {author}
          </div>
        ) : null}
        {quote ? (
          <blockquote className={styles.quote} data-tone={paletteIndex(quote.author)}>
            <span className={styles.quoteAuthor}>{quote.author}</span>
            <span className={styles.quoteText}>{quote.text}</span>
          </blockquote>
        ) : null}
        <div className={styles.text}>
          {children}
          {time ? (
            <span className={styles.meta}>
              {time}
              {direction === "out" && read !== undefined ? (
                <CheckCheck size={15} aria-label={read ? "прочитано" : "отправлено"} />
              ) : null}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ServiceMessage({ children }: { children: ReactNode }) {
  return (
    <div className={styles.service}>
      <span>{children}</span>
    </div>
  );
}
