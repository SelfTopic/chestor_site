export type Point = [number, number];

// Точка на краю прямоугольника (центр c, размеры w×h) в сторону точки toward.
export function borderPoint(c: Point, w: number, h: number, toward: Point): Point {
  const dx = toward[0] - c[0];
  const dy = toward[1] - c[1];
  if (dx === 0 && dy === 0) return c;
  const tx = dx === 0 ? Infinity : w / 2 / Math.abs(dx);
  const ty = dy === 0 ? Infinity : h / 2 / Math.abs(dy);
  const t = Math.min(tx, ty);
  return [c[0] + dx * t, c[1] + dy * t];
}
