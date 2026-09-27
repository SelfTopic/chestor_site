import Link from "next/link";

import { CodeBlock } from "@/components/code/CodeBlock";
import { DialogScreen } from "@/components/dialog/DialogScreen";
import { Thread } from "@/components/dialog/Thread";
import { ChannelPost } from "@/components/tg/ChannelPost";
import { InlineKeyboard } from "@/components/tg/InlineKeyboard";
import { DIALOGS } from "@/content/dialogs";
import { SR_CHANNEL_POSTS, SR_LINKS } from "@/content/selfrotgram";

import styles from "./SelfrotChannel.module.css";

export function SelfrotChannel() {
  const dialog = DIALOGS.selfrotgram;
  return (
    <DialogScreen dialog={dialog}>
      <Thread dialogId="selfrotgram" label="Канал selfrotgram" placeholder="Комментировать…">
        {SR_CHANNEL_POSTS.map((post) => (
          <ChannelPost key={post.id} id={post.id} channel="selfrotgram" glyph="selfrotgram" time={post.dated}>
            <h2 className={styles.title}>{post.title}</h2>
            <p>{post.text}</p>
            {post.code ? <CodeBlock code={post.code} /> : null}
            {post.cta ? (
              <Link href={post.cta.href} className={styles.cta}>
                {post.cta.label}
              </Link>
            ) : null}
          </ChannelPost>
        ))}
        <InlineKeyboard
          rows={[
            [{ label: "Страница фреймворка", href: "/selfrotgram" }],
            [
              { label: "GitHub", href: SR_LINKS.github },
              { label: "PyPI", href: SR_LINKS.pypi },
            ],
          ]}
        />
      </Thread>
    </DialogScreen>
  );
}
