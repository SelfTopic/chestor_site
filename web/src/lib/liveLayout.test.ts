import { expect, test } from "vitest";

import type { LiveMessage } from "./chatApi";
import { layoutMessages } from "./liveLayout";

const at = (id: string, author: string, ts: number, clientId: string | null = null): LiveMessage => ({
  id,
  source: clientId ? "site" : "telegram",
  author,
  text: id,
  ts,
  quote: null,
  client_id: clientId,
});

const dayOf = (ts: number) => (ts < 100 ? "день 1" : "день 2");

test("серии по автору и смена дня", () => {
  const rows = layoutMessages(
    [at("1", "Тока", 1), at("2", "Тока", 2), at("3", "Ута", 3), at("4", "Ута", 150)],
    new Set(),
    dayOf,
  );
  expect(rows.map((row) => row.day)).toEqual(["день 1", null, null, "день 2"]);
  expect(rows.map((row) => row.showAuthor)).toEqual([true, false, true, true]);
  expect(rows.map((row) => row.lastInGroup)).toEqual([false, true, true, true]);
});

test("свои сообщения без имени", () => {
  const rows = layoutMessages([at("1", "Я", 1, "c1"), at("2", "Я", 2, "c2")], new Set(["c1"]), dayOf);
  expect(rows[0]).toMatchObject({ mine: true, showAuthor: false });
  expect(rows[1]).toMatchObject({ mine: false, showAuthor: false });
});
