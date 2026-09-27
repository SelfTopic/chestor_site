import type { DialogId } from "./dialogs";

type AutoReply = { text: string; link?: { href: string; label: string } };

export const AUTO_REPLIES: Partial<Record<DialogId, AutoReply>> = {
  self: {
    text: "Это сайт, а не мой Telegram: сюда я не отвечаю. Живой я — там.",
    link: { href: "https://t.me/Self_topic", label: "Написать @Self_topic" },
  },
  projects: {
    text: "В канал пишут только админы. Поговорить можно в Live-чате — он настоящий.",
    link: { href: "/c/live", label: "Открыть Live-чат" },
  },
  selfrotgram: {
    text: "Комментарии к каналу закрыты, зато код открыт.",
    link: { href: "https://github.com/SelfTopic/selfrotgram", label: "selfrotgram на GitHub" },
  },
};
