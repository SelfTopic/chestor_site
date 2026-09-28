import { expect, test } from "vitest";

import { splitCode } from "./richText";

test("выделяет код в обратных кавычках", () => {
  expect(splitCode("a `b` c")).toEqual([
    { kind: "text", value: "a " },
    { kind: "code", value: "b" },
    { kind: "text", value: " c" },
  ]);
});

test("без кода и с непарной кавычкой — просто текст", () => {
  expect(splitCode("просто текст")).toEqual([{ kind: "text", value: "просто текст" }]);
  expect(splitCode("a ` b")).toEqual([{ kind: "text", value: "a ` b" }]);
});
