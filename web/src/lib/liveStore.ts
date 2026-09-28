"use client";

import { useSyncExternalStore } from "react";

import {
  backoffDelay,
  chatApi,
  type ChatMode,
  type History,
  type LiveMessage,
  mergeMessages,
  websocketUrl,
} from "./chatApi";

export type LiveStatus = "idle" | "connecting" | "online" | "offline";

export type LiveState = {
  status: LiveStatus;
  loaded: boolean;
  messages: LiveMessage[];
  online: number | null;
  mode: ChatMode | null;
  captcha: History["captcha"] | null;
  mutedUntil: number | null;
  passExpiresAt: number | null;
  limits: History["limits"];
  unread: number;
  typing: { nick: string; until: number }[];
};

const INITIAL: LiveState = {
  status: "idle",
  loaded: false,
  messages: [],
  online: null,
  mode: null,
  captcha: null,
  mutedUntil: null,
  passExpiresAt: null,
  limits: { nick_min: 2, nick_max: 24, text_max: 300 },
  unread: 0,
  typing: [],
};

let state: LiveState = INITIAL;
const listeners = new Set<() => void>();
const messageListeners = new Set<(message: LiveMessage) => void>();
let socket: WebSocket | null = null;
let attempt = 0;
let reconnectTimer: number | undefined;
let pingTimer: number | undefined;
let started = false;
let viewing = false;

function update(patch: Partial<LiveState>): void {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

type ServerEvent =
  | { type: "hello"; online: number; mode: ChatMode }
  | { type: "online"; count: number }
  | { type: "message"; message: LiveMessage }
  | { type: "typing"; nick: string }
  | { type: "pong" };

const TYPING_SHOWN_MS = 4000;

async function loadHistory(): Promise<void> {
  const history = await chatApi.history();
  update({
    loaded: true,
    messages: mergeMessages(state.messages, history.messages),
    online: history.online,
    mode: history.mode,
    captcha: history.captcha,
    mutedUntil: history.muted_until,
    passExpiresAt: history.pass_expires_at,
    limits: history.limits,
  });
}

function scheduleReconnect(): void {
  window.clearTimeout(reconnectTimer);
  reconnectTimer = window.setTimeout(connect, backoffDelay(attempt++));
}

function connect(): void {
  update({ status: "connecting" });
  let ws: WebSocket;
  try {
    ws = new WebSocket(websocketUrl(window.location));
  } catch {
    update({ status: "offline" });
    scheduleReconnect();
    return;
  }
  socket = ws;

  ws.onopen = () => {
    attempt = 0;
    update({ status: "online" });
    // После переподключения история догоняет всё, что пришло, пока связи не было.
    loadHistory().catch(() => undefined);
    window.clearInterval(pingTimer);
    pingTimer = window.setInterval(() => ws.readyState === WebSocket.OPEN && ws.send("ping"), 25_000);
  };

  ws.onmessage = (event: MessageEvent<string>) => {
    let data: ServerEvent;
    try {
      data = JSON.parse(event.data) as ServerEvent;
    } catch {
      return;
    }
    if (data.type === "hello") update({ online: data.online, mode: data.mode });
    else if (data.type === "online") update({ online: data.count });
    else if (data.type === "typing") {
      const now = Date.now();
      const others = state.typing.filter((item) => item.nick !== data.nick && item.until > now);
      update({ typing: [...others, { nick: data.nick, until: now + TYPING_SHOWN_MS }] });
      window.setTimeout(() => update({ typing: state.typing.filter((item) => item.until > Date.now()) }), TYPING_SHOWN_MS + 50);
    }
    else if (data.type === "message") {
      update({
        messages: mergeMessages(state.messages, [data.message]),
        unread: viewing ? 0 : state.unread + 1,
        typing: state.typing.filter((item) => item.nick !== data.message.author),
      });
      messageListeners.forEach((listener) => listener(data.message));
    }
  };

  ws.onclose = () => {
    window.clearInterval(pingTimer);
    if (socket === ws) socket = null;
    update({ status: "offline" });
    scheduleReconnect();
  };
}

export function startLive(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  loadHistory().catch(() => update({ status: "offline", loaded: true }));
  connect();
}

export function setLiveViewing(value: boolean): void {
  viewing = value;
  if (value && state.unread) update({ unread: 0 });
}

let lastTypingSent = 0;

// Сервер пропускает «печатает…» не чаще раза в 2 с; шлём раз в 3 с, пока идёт набор.
export function sendTyping(nick: string): void {
  const now = Date.now();
  if (now - lastTypingSent < 3000 || socket?.readyState !== WebSocket.OPEN) return;
  lastTypingSent = now;
  socket.send(JSON.stringify({ type: "typing", nick }));
}

export function setPassExpiresAt(value: number | null): void {
  update({ passExpiresAt: value });
}

export function refreshLive(): Promise<void> {
  return loadHistory();
}

export function onLiveMessage(listener: (message: LiveMessage) => void): () => void {
  messageListeners.add(listener);
  return () => messageListeners.delete(listener);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLive(): LiveState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => INITIAL,
  );
}
