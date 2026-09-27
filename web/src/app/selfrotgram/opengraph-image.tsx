import { OG_SIZE, ogImage } from "@/og/card";

export const alt = "selfrotgram — типы говорят правду";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    kicker: "TELEGRAM BOT API · PYTHON",
    title: "selfrotgram",
    subtitle: "Типы говорят правду: фильтр гарантирует, тип обещает, библиотека сверяет при импорте.",
    tag: "РАНГ SS",
  });
}
