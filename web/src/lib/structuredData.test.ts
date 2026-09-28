import { expect, test } from "vitest";

import { BOT_FAQ, BOT_TELEGRAM } from "@/content/bot";

import { buildLlmsTxt } from "./llmsTxt";
import { botFaqLd, botGameLd, personLd, serializeLd } from "./structuredData";

test("FAQ в разметке совпадает с видимым FAQ на /bot", () => {
  const entities = botFaqLd().mainEntity as { name: string; acceptedAnswer: { text: string } }[];
  expect(entities.map((item) => [item.name, item.acceptedAnswer.text])).toEqual(
    BOT_FAQ.map((item) => [item.question, item.answer]),
  );
});

test("игра ведёт в Telegram-бота и ссылается на автора", () => {
  const game = botGameLd();
  expect(game.sameAs).toContain(BOT_TELEGRAM.href);
  expect(game.author).toEqual({ "@id": personLd()["@id"] });
});

test("serializeLd не даёт закрыть тег script", () => {
  const out = serializeLd({ text: "</script><script>alert(1)</script>" });
  expect(out).not.toContain("</script>");
  expect(JSON.parse(out)).toEqual({ text: "</script><script>alert(1)</script>" });
});

test("llms.txt отвечает, как поиграть, и не публикует личную почту", () => {
  const text = buildLlmsTxt();
  expect(text).toContain("## Как поиграть в «Токийского гуля» в Telegram");
  expect(text).toContain(BOT_TELEGRAM.href);
  expect(text).not.toContain("selftopic@gmail.com");
});
