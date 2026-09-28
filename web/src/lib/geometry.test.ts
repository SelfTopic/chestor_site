import { expect, test } from "vitest";

import { borderPoint } from "./geometry";

test("край прямоугольника по горизонтали и вертикали", () => {
  expect(borderPoint([0, 0], 100, 50, [200, 0])).toEqual([50, 0]);
  expect(borderPoint([0, 0], 100, 50, [0, -200])).toEqual([0, -25]);
});

test("диагональ упирается в ближайшую сторону", () => {
  const [x, y] = borderPoint([0, 0], 100, 50, [100, 100]);
  expect(y).toBe(25);
  expect(x).toBe(25);
});
