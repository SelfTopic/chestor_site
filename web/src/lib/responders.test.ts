import { describe, expect, test } from "vitest";

import { normalize, respond } from "./responders";

const first = () => 0;

describe("chestor_bot", () => {
  test("/start отвечает приветствием, в том числе с @username", () => {
    expect(respond("chestor_bot", "/start", first)[0]?.text).toMatch(/^Привет, Гость!/);
    expect(respond("chestor_bot", "/start@chestor_bot", first)[0]?.text).toMatch(/^Привет, Гость!/);
  });

  test("команды без слеша понимаются без учёта регистра и ё", () => {
    expect(respond("chestor_bot", "  Растить   КАГУНЕ ", first)[0]?.text).toContain("Укаку");
    expect(respond("chestor_bot", "щёлк", first)[0]?.text).toContain("🫰");
  });

  test("непонятное ведёт в досье", () => {
    const [reply] = respond("chestor_bot", "как дела", first);
    expect(reply?.link?.href).toBe("/bot");
  });
});

test("статичные диалоги отвечают автоответом", () => {
  expect(respond("self", "привет")[0]?.link?.href).toBe("https://t.me/chestor");
  expect(respond("live", "привет")).toEqual([]);
});

test("normalize", () => {
  expect(normalize(" Ёж  ЁЛКА ")).toBe("еж елка");
});
