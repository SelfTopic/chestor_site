import { expect, test } from "vitest";

import { applyAnswer, EMPTY_SCORE, pickOption } from "./quizScore";

test("счёт, серия и рекорд", () => {
  let score = EMPTY_SCORE;
  for (const correct of [true, true, false, true]) score = applyAnswer(score, correct);
  expect(score).toEqual({ score: 3, streak: 1, best: 2 });
});

test("ответ номером или текстом", () => {
  const options = ["Укаку", "Коукаку", "Ринкаку", "Бикаку"];
  expect(pickOption("3", options)).toBe("Ринкаку");
  expect(pickOption(" ринкаку ", options)).toBe("Ринкаку");
  expect(pickOption("5", options)).toBeNull();
  expect(pickOption("3.5", options)).toBeNull();
  expect(pickOption("кагуне", options)).toBeNull();
});
