"use client";

import { Pin, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDeferredValue, useState } from "react";

import { Avatar } from "@/components/tg/Avatar";
import { dialogHref, type DialogMeta } from "@/content/dialogs";
import { UI } from "@/content/ui";
import { previewText } from "@/lib/chatApi";
import { useLive } from "@/lib/liveStore";
import { formatTime } from "@/lib/time";

import styles from "./DialogList.module.css";

function matches(dialog: DialogMeta, query: string): boolean {
  const haystack = `${dialog.title} ${dialog.preview.text} ${dialog.description}`.toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

export function DialogList({ dialogs }: { dialogs: DialogMeta[] }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const live = useLive();
  const lastLive = live.messages.at(-1);
  const visible = dialogs.filter((dialog) => matches(dialog, deferred));

  return (
    <nav className={styles.nav} aria-label="Диалоги">
      <label className={styles.search}>
        <Search size={18} aria-hidden="true" />
        <span className="visually-hidden">{UI.search}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={UI.search}
          className={styles.searchInput}
        />
      </label>
      <ul className={styles.list}>
        {visible.map((dialog) => {
          const href = dialogHref(dialog.id);
          const active = pathname === href || (pathname === "/" && dialog.id === "self");
          const isLive = dialog.id === "live";
          const preview = isLive && lastLive ? { author: lastLive.author, text: previewText(lastLive) } : dialog.preview;
          const time = isLive && lastLive ? formatTime(new Date(lastLive.ts * 1000)) : dialog.time;
          return (
            <li key={dialog.id}>
              <Link
                href={href}
                className={styles.item}
                data-active={active || undefined}
                data-desktop-active={pathname === "/" && dialog.id === "self" ? true : undefined}
                aria-current={active ? "page" : undefined}
              >
                <Avatar glyph={dialog.glyph} size={52} online={isLive && (live.online ?? 0) > 0} />
                <span className={styles.body}>
                  <span className={styles.line}>
                    <span className={styles.title}>{dialog.title}</span>
                    <span className={styles.time}>{time}</span>
                  </span>
                  <span className={styles.line}>
                    <span className={styles.preview}>
                      {preview.author ? <span className={styles.previewAuthor}>{preview.author}: </span> : null}
                      {preview.text}
                    </span>
                    {isLive && live.unread > 0 ? (
                      <span className={styles.badge} aria-label={`непрочитанных: ${live.unread}`}>
                        {live.unread > 99 ? "99+" : live.unread}
                      </span>
                    ) : dialog.pinned ? (
                      <Pin size={16} className={styles.pin} aria-label={UI.pinned} />
                    ) : null}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {visible.length === 0 ? <p className={styles.empty}>{UI.searchEmpty}</p> : null}
    </nav>
  );
}
