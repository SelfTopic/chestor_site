// Браузер ходит только в свой бэкенд: /chat/* (в dev — rewrites на localhost:8080).
export type Quote = { author: string; text: string };

export type LiveMessage = {
  id: string;
  source: "telegram" | "site";
  author: string;
  text: string;
  ts: number;
  quote: Quote | null;
  client_id: string | null;
};

export type ChatMode = "mock" | "telegram";

export type History = {
  messages: LiveMessage[];
  online: number;
  mode: ChatMode;
  captcha: "live" | "fixture";
  muted_until: number | null;
  pass_expires_at: number | null;
  limits: { nick_min: number; nick_max: number; text_max: number };
};

export type Challenge = {
  challenge_id: string;
  question: string;
  options: string[];
  source: "live" | "fixture";
  expires_in: number;
};

export type Verdict = { correct: boolean; answer: string; pass_expires_at: number | null };

export type ApiErrorCode =
  | "invalid"
  | "captcha_required"
  | "banned"
  | "muted"
  | "rate_limited"
  | "queue_full"
  | "challenge_expired"
  | "quiz_unavailable"
  | "too_many_connections"
  | "network";

export class ChatApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly retryAfter: number | null = null,
    readonly field: string | null = null,
  ) {
    super(message);
  }
}

type ErrorBody = { error?: { code?: string; message?: string; retry_after?: number; field?: string } };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { credentials: "same-origin", cache: "no-store", ...init });
  } catch {
    throw new ChatApiError("network", "Сервер чата недоступен");
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = (body as ErrorBody | null)?.error;
    throw new ChatApiError(
      (error?.code as ApiErrorCode | undefined) ?? "network",
      error?.message ?? `HTTP ${response.status}`,
      error?.retry_after ?? null,
      error?.field ?? null,
    );
  }
  return body as T;
}

const json = (data: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

export const chatApi = {
  history: () => request<History>("/chat/history"),
  send: (nick: string, text: string, clientId: string) =>
    request<{ ok: true; queued: number }>("/chat/send", json({ nick, text, client_id: clientId })),
  captcha: () => request<Challenge>("/chat/captcha"),
  answer: (challengeId: string, answer: string) =>
    request<Verdict>("/chat/captcha", json({ challenge_id: challengeId, answer })),
};

export function websocketUrl(location: Pick<Location, "protocol" | "host">): string {
  return `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/chat/ws`;
}

// Экспоненциальная пауза с джиттером: 1, 2, 4… до 30 с, чтобы вкладки не ломились разом.
export function backoffDelay(attempt: number, random: () => number = Math.random): number {
  const base = Math.min(30_000, 1000 * 2 ** Math.max(0, attempt));
  return Math.round(base * (0.75 + random() * 0.5));
}

export type PendingMessage = {
  clientId: string;
  nick: string;
  text: string;
  ts: number;
  state: "sending" | "queued" | "failed";
  error?: string;
};

export function mergeMessages(existing: LiveMessage[], incoming: LiveMessage[], keep = 200): LiveMessage[] {
  const byId = new Map(existing.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort((a, b) => a.ts - b.ts || a.id.localeCompare(b.id)).slice(-keep);
}

export function settlePending(pending: PendingMessage[], arrived: LiveMessage[]): PendingMessage[] {
  const delivered = new Set(arrived.map((message) => message.client_id).filter(Boolean));
  return pending.filter((item) => !delivered.has(item.clientId));
}

export function newClientId(): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
