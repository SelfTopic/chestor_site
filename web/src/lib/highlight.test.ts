import { expect, test } from "vitest";

import { highlightPython } from "./highlight";

const kinds = (code: string) => highlightPython(code).filter((token) => token.kind !== "text");

test("ключевые слова, типы, вызовы и комментарии", () => {
  expect(kinds("class Echo(Base):  # коммент")).toEqual([
    { kind: "keyword", value: "class" },
    { kind: "type", value: "Echo" },
    { kind: "type", value: "Base" },
    { kind: "comment", value: "# коммент" },
  ]);
  expect(kinds("await answer(x)")).toEqual([
    { kind: "keyword", value: "await" },
    { kind: "func", value: "answer" },
  ]);
});

test("строки не разбираются внутри, # в строке — не комментарий", () => {
  expect(kinds('f"{a + b} # не коммент"')).toEqual([{ kind: "string", value: 'f"{a + b} # не коммент"' }]);
});

test("исходный текст восстанавливается без потерь", () => {
  const code = '@router.message(Command("sum"))\nasync def f(x: int = 2):\n    return x';
  expect(
    highlightPython(code)
      .map((token) => token.value)
      .join(""),
  ).toBe(code);
});
