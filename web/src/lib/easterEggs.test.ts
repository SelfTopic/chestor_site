import { expect, test } from "vitest";

import { isThousandMinusSeven, thousandMinusSeven } from "./easterEggs";
import { respond } from "./responders";

test("распознаёт 1000-7 в разных написаниях", () => {
  for (const text of ["1000-7", " 1000 - 7 ", "1000—7?", "1000 минус 7", "1000-7..."]) {
    expect(isThousandMinusSeven(text)).toBe(true);
  }
  for (const text of ["1000-8", "1000-77", "сколько будет 1000-7", "10007"]) {
    expect(isThousandMinusSeven(text)).toBe(false);
  }
});

test("отсчёт идёт по 7 и ускоряется, в конце пробуждение", () => {
  const replies = thousandMinusSeven(5);
  expect(replies.slice(0, 5).map((reply) => reply.text)).toEqual(["993", "986", "979", "972", "965"]);
  expect(replies[1]!.delay).toBeLessThan(replies[0]!.delay);
  expect(replies.at(-1)?.effect).toBe("awaken");
});

test("пасхалка работает в любом диалоге", () => {
  for (const dialog of ["self", "projects", "live", "checkpoint", "chestor_bot", "selfrotgram"] as const) {
    expect(respond(dialog, "1000-7")[0]?.text).toBe("993");
  }
});

test("лорные пасхалки по ключевым словам", () => {
  expect(respond("self", "а кофе есть?")[0]?.text).toContain("Антейку");
  expect(respond("projects", "Дуров одобряет")[0]?.text).toContain("parse_mode");
  expect(respond("self", "Какой сегодня день?")[0]?.text).toContain("пасхалку");
  expect(respond("self", "меня ищет CCG")[0]?.text).toContain("хэшем");
});

test("без ключевых слов — обычный ответ диалога", () => {
  expect(respond("self", "привет")[0]?.link?.href).toBe("https://t.me/Self_topic");
  expect(respond("self", "кофейня")[0]?.link?.href).toBe("https://t.me/Self_topic");
});
