import { OG_SIZE, ogImage } from "@/og/card";

export const alt = "CheStor — сайт в виде Telegram-клиента";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    kicker: "SELF · CHESTOR",
    title: "CheStor",
    subtitle: "Бэкенд на Python, Telegram-боты и «Токийский гуль». Сайт — это Telegram-клиент.",
    tag: "1000-7",
  });
}
