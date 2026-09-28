import type { AvatarGlyph } from "@/components/tg/Avatar";

export const DIALOG_IDS = ["self", "live", "projects", "checkpoint", "chestor_bot", "selfrotgram"] as const;

export type DialogId = (typeof DIALOG_IDS)[number];

export type DialogKind = "private" | "channel" | "group" | "bot";

export type DialogMeta = {
  id: DialogId;
  title: string;
  kind: DialogKind;
  glyph: AvatarGlyph;
  subtitle: string;
  preview: { author?: string; text: string };
  time: string;
  pinned?: boolean;
  description: string;
};

export const DIALOGS: Record<DialogId, DialogMeta> = {
  self: {
    id: "self",
    title: "Self",
    kind: "private",
    glyph: "self",
    subtitle: "в сети · пишет бэкенд",
    preview: { text: "In code I trust, for it never lies or betrays — it simply executes." },
    time: "",
    pinned: true,
    description: "Кто такой Self: бэкенд на Python, Telegram-боты и «Токийский гуль».",
  },
  live: {
    id: "live",
    title: "Live-чат",
    kind: "group",
    glyph: "live",
    subtitle: "группа · синхронно с Telegram",
    preview: { text: "Пиши в настоящий Telegram-чат прямо с сайта" },
    time: "",
    pinned: true,
    description: "Чат, синхронный с настоящей Telegram-группой: пиши с сайта — бот перешлёт.",
  },
  projects: {
    id: "projects",
    title: "Проекты",
    kind: "channel",
    glyph: "projects",
    subtitle: "канал",
    preview: { author: "SSS", text: "chestor_bot — RPG-бот по «Токийскому гулю»" },
    time: "сен",
    description: "Проекты Self как посты канала, каждому — ранг угрозы CCG.",
  },
  checkpoint: {
    id: "checkpoint",
    title: "CCG Checkpoint",
    kind: "bot",
    glyph: "checkpoint",
    subtitle: "бот · проверка на гуля",
    preview: { text: "Докажи, что ты гуль: вопрос из Ghoul Quiz" },
    time: "",
    description: "Викторина по «Токийскому гулю» на Ghoul Quiz API.",
  },
  chestor_bot: {
    id: "chestor_bot",
    title: "@chestor_chat_bot",
    kind: "bot",
    glyph: "bot",
    subtitle: "бот · RPG по «Токийскому гулю»",
    preview: { text: "/start — и ты гуль. Голод прилагается." },
    time: "",
    description: "RPG-бот по «Токийскому гулю»: голод, кагуне, бои, экономика.",
  },
  selfrotgram: {
    id: "selfrotgram",
    title: "selfrotgram",
    kind: "channel",
    glyph: "selfrotgram",
    subtitle: "канал · фреймворк для Bot API",
    preview: { text: "Типы говорят правду." },
    time: "сен",
    description: "selfrotgram — асинхронная библиотека для Telegram Bot API, где типы говорят правду.",
  },
};

export const DIALOG_ORDER: readonly DialogId[] = DIALOG_IDS;

export function isDialogId(value: string): value is DialogId {
  return (DIALOG_IDS as readonly string[]).includes(value);
}

export function dialogHref(id: DialogId): string {
  return `/c/${id}`;
}
