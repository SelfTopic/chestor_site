import { DialogScreen } from "@/components/dialog/DialogScreen";
import { Thread } from "@/components/dialog/Thread";
import { Avatar } from "@/components/tg/Avatar";
import { InlineKeyboard } from "@/components/tg/InlineKeyboard";
import { MessageBubble } from "@/components/tg/MessageBubble";
import { DIALOGS } from "@/content/dialogs";
import { OWNER, SELF_MESSAGES, STACK } from "@/content/owner";

import { NowWorking } from "./NowWorking";
import styles from "./SelfDialog.module.css";

export function SelfDialog() {
  const dialog = DIALOGS.self;
  return (
    <DialogScreen dialog={dialog}>
      <Thread dialogId="self" label="Личный чат с Self" startAt="top" placeholder="Написать Self…">
        <section className={styles.profile} aria-label="Профиль">
          <Avatar glyph="self" size={96} />
          <h2 className={styles.name}>
            {OWNER.name} <span className={styles.alias}>aka {OWNER.gitName}</span>
          </h2>
          <p className={styles.role}>{OWNER.role}</p>
          <dl className={styles.rows}>
            <div>
              <dt>Telegram</dt>
              <dd>
                <a href={OWNER.links.telegram.href}>{OWNER.links.telegram.label}</a>
              </dd>
            </div>
            <div>
              <dt>GitHub</dt>
              <dd>
                <a href={OWNER.links.github.href}>{OWNER.links.github.label}</a>
              </dd>
            </div>
            <div>
              <dt>Почта</dt>
              <dd>
                <a href={OWNER.links.email.href}>{OWNER.links.email.label}</a>
              </dd>
            </div>
            <div>
              <dt>Откуда</dt>
              <dd>{OWNER.country}</dd>
            </div>
            <div>
              <dt>В git</dt>
              <dd>с {OWNER.since}</dd>
            </div>
          </dl>
        </section>

        <MessageBubble direction="in" tail={false}>
          {SELF_MESSAGES.hello}
        </MessageBubble>
        <MessageBubble direction="in" tail={false}>
          {SELF_MESSAGES.why}
        </MessageBubble>
        <MessageBubble direction="in">{SELF_MESSAGES.loves}</MessageBubble>

        <MessageBubble direction="in" wide>
          <span className={styles.stackIntro}>{SELF_MESSAGES.stackIntro}</span>
          <span className={styles.stack}>
            {STACK.map((group) => (
              <span className={styles.group} key={group.title}>
                <span className={styles.groupTitle}>{group.title}</span>
                <span className={styles.chips}>
                  {group.items.map((item) => (
                    <span className={styles.chip} key={item}>
                      {item}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </span>
        </MessageBubble>

        <MessageBubble direction="in" tail={false}>
          {SELF_MESSAGES.claude}
        </MessageBubble>
        <MessageBubble direction="in">
          <span className={styles.quote}>
            <span className={styles.quoteMark} aria-hidden="true">
              “
            </span>
            {OWNER.quote}
          </span>
        </MessageBubble>

        <NowWorking />
        <MessageBubble direction="in">{SELF_MESSAGES.since}</MessageBubble>
        <InlineKeyboard
          rows={[
            [
              { label: "Telegram", href: OWNER.links.telegram.href },
              { label: "GitHub", href: OWNER.links.github.href },
              { label: "Почта", href: OWNER.links.email.href },
            ],
            [
              { label: "Канал «Проекты»", href: "/c/projects" },
              { label: "Live-чат", href: "/c/live" },
            ],
          ]}
        />
      </Thread>
    </DialogScreen>
  );
}
