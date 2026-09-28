export type TokenKind = "keyword" | "string" | "comment" | "number" | "type" | "func" | "decorator" | "text";
export type Token = { kind: TokenKind; value: string };

const KEYWORDS = new Set([
  "async", "await", "class", "def", "return", "if", "else", "elif", "for", "in", "not", "and", "or",
  "import", "from", "as", "try", "except", "raise", "with", "None", "True", "False", "self", "pass", "lambda",
]);

// Грубая подсветка Python для витрины: строки, комментарии, ключевые слова, классы, вызовы.
const PATTERN =
  /(#[^\n]*)|(f?"(?:\\.|[^"\\\n])*"|f?'(?:\\.|[^'\\\n])*')|(@[A-Za-z_][\w.]*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/g;

export function highlightPython(code: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  const push = (kind: TokenKind, value: string) => {
    const previous = tokens[tokens.length - 1];
    if (previous && previous.kind === kind) previous.value += value;
    else tokens.push({ kind, value });
  };

  for (const match of code.matchAll(PATTERN)) {
    const index = match.index ?? 0;
    if (index > last) push("text", code.slice(last, index));
    const [value, comment, string, decorator, number, word] = match;
    if (comment) push("comment", value);
    else if (string) push("string", value);
    else if (decorator) push("decorator", value);
    else if (number) push("number", value);
    else if (word) {
      const next = code[index + value.length];
      if (KEYWORDS.has(word)) push("keyword", value);
      else if (/^[A-Z]/.test(word)) push("type", value);
      else if (next === "(") push("func", value);
      else push("text", value);
    }
    last = index + value.length;
  }
  if (last < code.length) push("text", code.slice(last));
  return tokens;
}
