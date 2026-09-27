import { expect, test } from "vitest";

import { initials, paletteIndex } from "./Avatar";

test("инициалы: одно или два слова, эмодзи не рвутся", () => {
  expect(initials("Канеки")).toBe("К");
  expect(initials("канеки кен")).toBe("КК");
  expect(initials("  ")).toBe("?");
  expect(initials("🦴 bone")).toBe("🦴B");
});

test("цвет ника стабилен и в пределах палитры", () => {
  expect(paletteIndex("Тока")).toBe(paletteIndex("Тока"));
  for (const name of ["a", "Ута", "Джузо", "x".repeat(50)]) {
    expect(paletteIndex(name)).toBeGreaterThanOrEqual(0);
    expect(paletteIndex(name)).toBeLessThan(7);
  }
});
