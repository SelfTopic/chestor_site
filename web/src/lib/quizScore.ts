export type Score = { score: number; streak: number; best: number };

export const EMPTY_SCORE: Score = { score: 0, streak: 0, best: 0 };

export function applyAnswer(current: Score, correct: boolean): Score {
  if (!correct) return { ...current, streak: 0 };
  const streak = current.streak + 1;
  return { score: current.score + 1, streak, best: Math.max(current.best, streak) };
}

// Ответ текстом: номер варианта (1–4) или сам вариант без учёта регистра.
export function pickOption(input: string, options: readonly string[]): string | null {
  const text = input.trim();
  const index = Number.parseInt(text, 10);
  if (String(index) === text && index >= 1 && index <= options.length) return options[index - 1] ?? null;
  const lower = text.toLocaleLowerCase("ru");
  return options.find((option) => option.toLocaleLowerCase("ru") === lower) ?? null;
}
