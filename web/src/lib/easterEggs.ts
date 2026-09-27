export type EggReply = { text: string; delay: number; effect?: "awaken" };

const THOUSAND_MINUS_SEVEN = /^1000\s*(?:[-−–—]|минус)\s*7[?!.…]*$/iu;

export function isThousandMinusSeven(text: string): boolean {
  return THOUSAND_MINUS_SEVEN.test(text.trim());
}

// Отсчёт Ямори: числа всё быстрее, потом пробуждение. В Telegram это не уходит.
export function thousandMinusSeven(steps = 10): EggReply[] {
  const numbers = Array.from({ length: steps }, (_, index) => ({
    text: String(1000 - 7 * (index + 1)),
    delay: Math.max(90, 520 - index * 55),
  }));
  return [
    ...numbers,
    { text: "…", delay: 900 },
    { text: "Хватит считать. Ты уже гуль.", delay: 1100, effect: "awaken" },
  ];
}
