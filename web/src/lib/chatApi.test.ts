import { describe, expect, test } from "vitest";

import { backoffDelay, type LiveMessage, mergeMessages, settlePending, websocketUrl } from "./chatApi";
import { checkNick } from "./nick";

const message = (id: string, ts: number, clientId: string | null = null): LiveMessage => ({
  id,
  source: clientId ? "site" : "telegram",
  author: "Тока",
  text: id,
  ts,
  quote: null,
  client_id: clientId,
});

describe("mergeMessages", () => {
  test("дедуп по id и сортировка по времени", () => {
    const merged = mergeMessages([message("tg:2", 2), message("tg:1", 1)], [message("tg:2", 2), message("tg:3", 3)]);
    expect(merged.map((item) => item.id)).toEqual(["tg:1", "tg:2", "tg:3"]);
  });

  test("держит не больше keep последних", () => {
    const many = Array.from({ length: 10 }, (_, index) => message(`tg:${index}`, index));
    expect(mergeMessages([], many, 3).map((item) => item.id)).toEqual(["tg:7", "tg:8", "tg:9"]);
  });
});

test("settlePending убирает доставленные по client_id", () => {
  const pending = [
    { clientId: "a", nick: "Н", text: "1", ts: 1, state: "queued" as const },
    { clientId: "b", nick: "Н", text: "2", ts: 2, state: "sending" as const },
  ];
  expect(settlePending(pending, [message("tg:9", 3, "a")]).map((item) => item.clientId)).toEqual(["b"]);
});

test("backoff растёт и упирается в 30 секунд", () => {
  const mid = () => 0.5;
  expect(backoffDelay(0, mid)).toBe(1000);
  expect(backoffDelay(3, mid)).toBe(8000);
  expect(backoffDelay(20, mid)).toBe(30000);
  expect(backoffDelay(1, () => 0)).toBe(1500);
});

test("websocketUrl по протоколу страницы", () => {
  expect(websocketUrl({ protocol: "https:", host: "chestor.site" })).toBe("wss://chestor.site/chat/ws");
  expect(websocketUrl({ protocol: "http:", host: "localhost:3000" })).toBe("ws://localhost:3000/chat/ws");
});

describe("checkNick", () => {
  test("чистит пробелы и принимает кириллицу", () => {
    expect(checkNick("  Канеки   Кен ")).toEqual({ ok: true, nick: "Канеки Кен" });
  });

  test("длина и символы", () => {
    expect(checkNick("к").ok).toBe(false);
    expect(checkNick("x".repeat(25)).ok).toBe(false);
    expect(checkNick("<script>").ok).toBe(false);
    expect(checkNick("гуль🦴").ok).toBe(false);
  });
});
