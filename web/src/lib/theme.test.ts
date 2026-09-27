import { describe, expect, test } from "vitest";

import { oppositeTheme, resolveTheme, themeInitScript } from "./theme";

describe("resolveTheme", () => {
  test("сохранённый выбор важнее системы", () => {
    expect(resolveTheme("human", true)).toBe("human");
    expect(resolveTheme("ghoul", false)).toBe("ghoul");
  });

  test("без выбора — по prefers-color-scheme", () => {
    expect(resolveTheme(null, true)).toBe("ghoul");
    expect(resolveTheme(null, false)).toBe("human");
  });

  test("мусор в localStorage игнорируется", () => {
    expect(resolveTheme("dark", true)).toBe("ghoul");
    expect(resolveTheme("", false)).toBe("human");
  });
});

test("oppositeTheme", () => {
  expect(oppositeTheme("human")).toBe("ghoul");
  expect(oppositeTheme("ghoul")).toBe("human");
});

test("скрипт инициализации ставит тему до отрисовки", () => {
  const attributes: Record<string, string> = {};
  const fakeWindow = {
    localStorage: { getItem: () => "ghoul" },
    matchMedia: () => ({ matches: false }),
    document: {
      documentElement: {
        setAttribute: (name: string, value: string) => {
          attributes[name] = value;
        },
      },
    },
  };
  new Function("window", "localStorage", "matchMedia", "document", themeInitScript)(
    fakeWindow,
    fakeWindow.localStorage,
    fakeWindow.matchMedia,
    fakeWindow.document,
  );
  expect(attributes["data-theme"]).toBe("ghoul");
});
