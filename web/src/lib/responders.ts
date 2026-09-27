import type { DialogId } from "@/content/dialogs";
import { AUTO_REPLIES, BOT_REPLIES, KAGUNE_NAMES, type ReplyLink } from "@/content/replies";

export type Reply = { text: string; delay: number; link?: ReplyLink };

type Random = () => number;

function pick<T>(items: readonly T[], random: Random): T {
  return items[Math.floor(random() * items.length) % items.length]!;
}

export function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ");
}

function botReply(text: string, random: Random): Omit<Reply, "delay"> {
  const command = normalize(text).replace(/@\w+$/, "");
  switch (command) {
    case "/start":
      return { text: BOT_REPLIES.start };
    case "/help":
      return BOT_REPLIES.help;
    case "растить кагуне":
      return { text: pick(BOT_REPLIES.birth, random).replace("{kagune}", pick(KAGUNE_NAMES, random)) };
    case "пить кофе":
      return { text: pick(BOT_REPLIES.coffee, random) };
    case "сожрать человека":
      return { text: pick(BOT_REPLIES.eat, random) };
    case "щелк":
      return { text: BOT_REPLIES.snap };
    case "профиль":
    case "/profile":
      return { text: BOT_REPLIES.profile };
    case "голод":
      return { text: BOT_REPLIES.hunger };
    default:
      return pick(BOT_REPLIES.fallback, random);
  }
}

export function respond(dialogId: DialogId, text: string, random: Random = Math.random): Reply[] {
  if (dialogId === "chestor_bot") return [{ ...botReply(text, random), delay: 700 }];
  const auto = AUTO_REPLIES[dialogId];
  return auto ? [{ ...auto, delay: 900 }] : [];
}
