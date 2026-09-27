import type { ApiErrorCode } from "@/lib/chatApi";

export const LIVE_TEXT = {
  demo: "Демо-режим: собеседники ненастоящие, Telegram не подключён.",
  intro:
    "Это настоящая Telegram-группа: пиши отсюда — бот перешлёт «Ник — текст». Ссылки, @упоминания и команды с сайта не проходят.",
  offline: "Связь с Антейку потеряна. Переподключаюсь…",
  connecting: "подключаюсь…",
  empty: "Пока тихо. Будь первым, кто нарушит тишину.",
  fromSite: "с сайта",
  nickLabel: "Ник",
  nickPlaceholder: "Как тебя звать?",
  nickSave: "Готово",
  nickChange: "Сменить ник",
  needNick: "Сначала выбери ник — под ним сообщение уйдёт в группу.",
  needPass: "Чтобы писать, докажи, что ты гуль: один вопрос из Ghoul Quiz.",
  passButton: "Пройти CCG Checkpoint",
  passOk: "Пропуск выдан до {time}. Пиши.",
  captchaFixture: "вопрос из резервной колоды: сервер квиза сейчас без сессии",
  captchaWrong: "Мимо. Правильно: «{answer}». Держи другой вопрос.",
  muted: "Админ закрыл вход с сайта до {time}.",
  placeholder: "Написать в группу…",
  placeholderLocked: "Сначала пропуск",
  newMessages: "новые сообщения",
  queued: "в очереди",
  sending: "отправляется",
  failed: "не ушло",
  retry: "Повторить",
  dismiss: "Убрать",
} as const;

export const ERROR_TEXT: Record<ApiErrorCode, string> = {
  invalid: "{message}",
  captcha_required: "CCG на проходной: сначала докажи, что ты гуль.",
  banned: "Тебя внесли в реестр CCG. С сайта сюда больше нельзя.",
  muted: "Админ закрыл вход с сайта. Попробуй позже.",
  rate_limited: "Кагуне ещё не отросло — подожди {seconds} с.",
  queue_full: "Очередь в Telegram забита. Через минуту полегчает.",
  challenge_expired: "Вопрос протух. Держи новый.",
  quiz_unavailable: "Ghoul Quiz молчит. Попробуй позже.",
  too_many_connections: "Слишком много вкладок с одного адреса.",
  network: "Сервер чата спит. Попробуй позже.",
};

export function errorText(code: ApiErrorCode, message: string, retryAfter: number | null): string {
  return ERROR_TEXT[code]
    .replace("{message}", message)
    .replace("{seconds}", String(Math.max(1, Math.ceil(retryAfter ?? 1))));
}

export const CHECKPOINT_TEXT = {
  intro:
    "КПП CCG. Вопросы — из Ghoul Quiz API, того же, что у chestor_bot. Отвечай кнопками. Первый верный ответ — пропуск в Live-чат.",
  start: "Начать проверку",
  next: "Следующий вопрос",
  correct: ["Верно. Следователь бы не знал.", "Точно. Пахнешь кофе из Антейку.", "Засчитано. Какуган не врёт."],
  wrong: "Мимо. Правильный ответ: «{answer}».",
  pass: "Пропуск в Live-чат выдан до {time}.",
  openLive: "Открыть Live-чат",
  score: "счёт {score} · серия {streak} · рекорд {best}",
  loading: "Сверяюсь с базой CCG…",
  useButtons: "Отвечай кнопками или номером варианта: следователь ждать не будет.",
  closed: "КПП закрыт: {reason}",
  fixture: "Вопросы сейчас из резервной колоды: у сервера нет сессии Ghoul Quiz.",
} as const;
