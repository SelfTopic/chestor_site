export type TextPart = { kind: "text" | "code"; value: string };

// Только `код` в обратных кавычках: разметку из данных мы не интерпретируем.
export function splitCode(text: string): TextPart[] {
  const parts: TextPart[] = [];
  const pattern = /`([^`]+)`/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ kind: "text", value: text.slice(last, index) });
    parts.push({ kind: "code", value: match[1] ?? "" });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push({ kind: "text", value: text.slice(last) });
  return parts;
}
