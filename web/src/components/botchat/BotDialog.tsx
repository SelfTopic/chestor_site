import Link from "next/link";

import { DialogScreen } from "@/components/dialog/DialogScreen";
import { Thread } from "@/components/dialog/Thread";
import { Avatar } from "@/components/tg/Avatar";
import { DIALOGS } from "@/content/dialogs";

import styles from "./BotDialog.module.css";

export const BOT_INTRO = {
  title: "Что умеет этот бот?",
  text: "RPG по «Токийскому гулю»: родись гулем, следи за голодом, дерись кагуне и копи CheSton. Здесь — демо на пару реплик, настоящий бот живёт в Telegram-чатах.",
  tryIt: ["/start", "растить кагуне", "пить кофе", "сожрать человека"],
} as const;

export function BotDialog() {
  const dialog = DIALOGS.chestor_bot;
  return (
    <DialogScreen dialog={dialog}>
      <Thread dialogId="chestor_bot" label="Диалог с @chestor_bot" placeholder="Команда для бота…">
        <section className={styles.intro} aria-label={BOT_INTRO.title}>
          <div className={styles.cover}>
            <Avatar glyph="bot" size={72} />
          </div>
          <h2 className={styles.title}>{BOT_INTRO.title}</h2>
          <p>{BOT_INTRO.text}</p>
          <p className={styles.try}>
            Попробуй:{" "}
            {BOT_INTRO.tryIt.map((command, index) => (
              <span key={command}>
                <code>{command}</code>
                {index < BOT_INTRO.tryIt.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
          <Link href="/bot" className={styles.dossier}>
            Досье CCG на chestor_bot →
          </Link>
        </section>
      </Thread>
    </DialogScreen>
  );
}
