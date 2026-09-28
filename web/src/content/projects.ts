// Проекты и хронология из docs/CONTENT.md. Цифры — только оттуда.
export const RANKS = ["SSS", "SS", "S", "A", "B"] as const;
export type Rank = (typeof RANKS)[number];

export type ProjectLink = { label: string; href: string };
export type ProjectFact = { value: string; label: string };

export type Project = {
  slug: string;
  title: string;
  rank: Rank | null;
  lang: string;
  tagline: string;
  summary: string;
  details: readonly string[];
  facts?: readonly ProjectFact[];
  stack: readonly string[];
  links: readonly ProjectLink[];
  dated: string;
  note?: string;
};

const gh = (repo: string): ProjectLink => ({ label: repo, href: `https://github.com/SelfTopic/${repo}` });

export const PROJECTS: readonly Project[] = [
  {
    slug: "archive",
    title: "Архив и мелочи",
    rank: null,
    lang: "TypeScript · Python",
    tagline: "То, из чего всё выросло",
    summary: "Прошлая версия сайта-визитки и боты, на которых набивались шишки.",
    details: [
      "my_site_next + websocket_my_site_server + jokes_api_express — прошлая версия сайта: Next.js, чат на WebSocket, API шуток (июнь 2025).",
      "self_topic_bot — бот-модератор чата на grammY, Drizzle и PostgreSQL.",
      "true_hax0r_bot_python — бот на aiogram с i18n.",
      "nu_nixua_sebe_bot — бот клана в CS:Source.",
    ],
    stack: ["Next.js", "WebSocket", "Express", "grammY", "Drizzle", "aiogram"],
    links: [gh("my_site_next"), gh("self_topic_bot")],
    dated: "",
  },
  {
    slug: "ras-interpreter",
    title: "RAS Interpreter",
    rank: "B",
    lang: "Python",
    tagline: "Первые шаги",
    summary: "Интерпретатор собственного языка RAS: `local nameVar :type: << value #`.",
    details: ["Лексер и ключевые слова.", "Апрель 2025 — один из первых репозиториев."],
    stack: ["Python"],
    links: [gh("ras_interpreter")],
    dated: "апр 2025",
  },
  {
    slug: "vscode-timer",
    title: "VS Code Timer",
    rank: "B",
    lang: "TypeScript",
    tagline: "Сколько времени ты на самом деле пишешь код",
    summary: "Расширение VS Code считает время сессии и общее, API собирает, сайт показывает таблицу участников.",
    details: [
      "vscode-timer-extension — статус-бар, время сессии и общее, SQLite.",
      "vscode-timer-api — Express + SQLite.",
      "vscode-timer-site — Next.js, таблица участников.",
    ],
    stack: ["VS Code Extension API", "Express", "SQLite", "Next.js"],
    links: [gh("vscode-timer-extension"), gh("vscode-timer-api"), gh("vscode-timer-site")],
    dated: "июл 2025",
  },
  {
    slug: "rasp",
    title: "Расписание ВСГУТУ",
    rank: "B",
    lang: "Python",
    tagline: "Расписание картинкой по команде",
    summary:
      "REST API парсит расписание Восточно-Сибирского государственного университета технологий и управления и рисует его картинкой, бот отдаёт её в Telegram.",
    details: ["rasp_rest_api — Flask, Docker.", "rasp_telegram_bot — aiogram 3: `/tod`, `/tom`, `/set_group`."],
    stack: ["Flask", "aiogram 3", "Docker"],
    links: [gh("rasp_rest_api"), gh("rasp_telegram_bot")],
    dated: "осень 2025",
  },
  {
    slug: "vk-hackathon",
    title: "Хакатон: «Университет третьего возраста»",
    rank: "B",
    lang: "Python",
    tagline: "VK Mini App для старшего поколения",
    summary:
      "Образовательное пространство во ВКонтакте для людей пенсионного и предпенсионного возраста.",
    details: ["Бэкенд: FastAPI, SQLAlchemy, PostgreSQL, dependency-injector, Docker."],
    stack: ["FastAPI", "SQLAlchemy", "PostgreSQL", "dependency-injector", "Docker"],
    links: [gh("yopta_vk_mini_app_hackathon")],
    dated: "осень 2025",
  },
  {
    slug: "questions-ghoul-api",
    title: "Questions Ghoul API",
    rank: "S",
    lang: "TypeScript",
    tagline: "База вопросов по «Токийскому гулю» с честной авторизацией",
    summary:
      "REST API с вопросами викторины по «Токийскому гулю». Работает на chestor.site/api — викторина на этом сайте ходит туда же.",
    details: [
      "Гостевой доступ (10 вопросов в час, без ответов) и вход по 6-значному коду из письма.",
      "JWT access на 7 дней и одноразовые refresh-токены на 30 дней с ротацией.",
      "Повторно предъявленный refresh-токен считается утечкой — отзывается вся сессия.",
      "Лимиты на Redis по IP и по субъекту; в БД лежит только sha256 refresh-токенов.",
      "ghoul-quiz-lib — асинхронный клиент на Python: автообновление токенов, гостевой режим, консольные викторины на время, на выживание и с множителем. Используется в chestor_bot.",
    ],
    stack: ["Node.js 24", "Express 5", "PostgreSQL", "Drizzle", "Redis", "Zod", "JWT", "Vitest", "Docker"],
    links: [
      gh("questions_ghoul_api"),
      { label: "ghoul-quiz-lib", href: "https://github.com/SelfTopic/questions_ghoul_api_lib" },
    ],
    dated: "2026",
  },
  {
    slug: "tiktok-userbot",
    title: "tiktok-userbot",
    rank: "B",
    lang: "Python",
    tagline: "Кинул ссылку — получил видео",
    summary: "Юзербот на Kurigram: в заданном чате отвечает на ссылки TikTok скачанным видео или слайдшоу.",
    details: [
      "Три способа скачать по очереди: yt-dlp → gallery-dl → tikwm.",
      "Раскрывает короткие ссылки, сам обновляет загрузчики, вход по QR.",
      "Образ в GHCR собирает GitHub Actions.",
    ],
    stack: ["Kurigram", "yt-dlp", "gallery-dl", "GitHub Actions", "GHCR"],
    links: [gh("tiktok-userbot")],
    dated: "сен 2026",
  },
  {
    slug: "voice-player",
    title: "voice-player",
    rank: "A",
    lang: "Python",
    tagline: "«Джарвис» для KDE Plasma",
    summary: "Голосовой ассистент: быстрые команды офлайн, свободные запросы — с поиском музыки в Telegram и видео на YouTube.",
    details: [
      "«Пауза», «дальше», «терминал» — офлайн через Vosk.",
      "«Джарвис, включи …» — faster-whisper, поиск музыки в Telegram и видео на YouTube.",
      "Окна (kdotool), громкость, MPRIS-плееры.",
      "Ставится одним install.sh, работает systemd-сервисом.",
    ],
    stack: ["Vosk", "faster-whisper", "MPRIS", "kdotool", "systemd"],
    links: [gh("voice-player")],
    dated: "сен 2026",
  },
  {
    slug: "userbot-api",
    title: "userbot-api",
    rank: "A",
    lang: "Python",
    tagline: "Руки для Claude в настоящем Telegram",
    summary:
      "HTTP API над тестовыми Telegram-аккаунтами: написать боту, дождаться ответа, нажать inline-кнопку. Сделан, чтобы Claude Code в облаке проверял ботов вживую.",
    details: [
      "Несколько аккаунтов — для команд на двоих (дуэли, переводы).",
      "Видит только разрешённые чаты.",
      "Pyrogram, Docker, Caddy/nginx, тесты.",
    ],
    stack: ["Pyrogram", "aiohttp", "Docker", "Caddy/nginx"],
    links: [gh("userbot-api")],
    dated: "сен 2026",
  },
  {
    slug: "selfrotgram",
    title: "selfrotgram",
    rank: "SS",
    lang: "Python",
    tagline: "Типы говорят правду",
    summary:
      "Асинхронная библиотека для Telegram Bot API: если хендлер обещает, что у сообщения есть текст, фильтр это проверил, а `message.text` — `str`, а не `str | None`.",
    details: [
      "Несоответствие фильтра и типа — ошибка при импорте, а не в проде.",
      "Ничего неявного: всё, что нужно хендлеру, лежит в `self.ctx`.",
      "Типы, методы и фильтры генерируются из официальной спецификации Bot API.",
      "Типизированные FSM-диалоги и callback_data, CommandArgs, отложенные вызовы, вебхуки.",
      "CLI: `selfrot init`, `selfrot add router`, `selfrot tree`, `selfrot check --strict`.",
      "Вдохновение: aiogram (охват и структура) + grammY (эргономика контекста).",
    ],
    facts: [
      { value: "10.3", label: "версия Bot API" },
      { value: "400", label: "типов" },
      { value: "185", label: "методов" },
      { value: "117", label: "суженных типов" },
      { value: "200+", label: "тестов" },
    ],
    stack: ["aiohttp", "pydantic v2", "pyright", "PyPI", "GitHub Actions"],
    links: [
      { label: "Страница фреймворка", href: "/selfrotgram" },
      gh("selfrotgram"),
      { label: "PyPI", href: "https://pypi.org/project/selfrotgram/" },
    ],
    dated: "сен 2026",
    note: "Альфа: версии 0.1.1–0.1.4 на PyPI.",
  },
  {
    slug: "chestor-bot",
    title: "chestor_bot",
    rank: "SSS",
    lang: "Python",
    tagline: "RPG-бот по «Токийскому гулю»",
    summary:
      "Гули со статами, голодом, смертью и возрождением; кагуне четырёх типов; дуэли и бои с мобами; своя экономика. Игровой цикл закрыт: голод → смерть → регенерация → прокачка → бои.",
    details: [
      "Первый кагуне выпадает случайно — «генетическая лотерея», осознанное лорное решение.",
      "Прогресс уровня в процентах, а не в сыром опыте: фиксированными боями опыт не нафармить.",
      "Боевой движок — чистый домен без БД и Telegram: дуэли, мобы, засада во время охоты.",
      "Экономика: CheSton и RC-клетки — избыток RC в теле как лорная валюта.",
      "Тексты — YAML с горячей перезагрузкой и сгенерированным типизированным деревом.",
      "Написан на aiogram 3, в сентябре 2026 целиком перенесён на selfrotgram.",
    ],
    facts: [
      { value: "1.0.0", label: "версия" },
      { value: "659", label: "тестов" },
      { value: "~360", label: "коммитов" },
      { value: "22", label: "миграции Alembic" },
      { value: "~42 тыс.", label: "строк" },
    ],
    stack: ["selfrotgram", "SQLAlchemy 2 async", "PostgreSQL 16", "Alembic", "dependency-injector", "Docker Compose"],
    links: [{ label: "Досье бота", href: "/bot" }, gh("chestor_bot")],
    dated: "сен 2026",
  },
];

export type Era = { id: string; label: string; text: string; projects: readonly string[] };

export const TIMELINE: readonly Era[] = [
  {
    id: "2025-04",
    label: "Апрель 2025",
    text: "Первые репозитории: интерпретатор RAS, бот на grammY, первые наброски selfrotgram.",
    projects: ["ras-interpreter"],
  },
  {
    id: "2025-summer",
    label: "Лето 2025",
    text: "TypeScript: Express API, Next.js, VS Code Timer, первый сайт с WebSocket-чатом.",
    projects: ["vscode-timer"],
  },
  {
    id: "2025-autumn",
    label: "Осень 2025",
    text: "Python-бэкенды: расписание ВСГУТУ, хакатон VK, старт chestor_bot.",
    projects: ["rasp", "vk-hackathon"],
  },
  {
    id: "2026",
    label: "2026",
    text: "chestor_bot дорастает до боевого движка и экономики; появляется Questions Ghoul API.",
    projects: ["questions-ghoul-api"],
  },
  {
    id: "2026-09",
    label: "Сентябрь 2026",
    text: "selfrotgram переписан с нуля и выходит на PyPI, chestor_bot переезжает на него и получает 1.0.0 — больше 200 коммитов за месяц. Плюс voice-player, userbot-api, tiktok-userbot.",
    projects: ["tiktok-userbot", "voice-player", "userbot-api", "selfrotgram", "chestor-bot"],
  },
];

export const ARCHIVE_SLUG = "archive";

export function projectBySlug(slug: string): Project {
  const project = PROJECTS.find((item) => item.slug === slug);
  if (!project) throw new Error(`Нет проекта ${slug}`);
  return project;
}

export const RANK_TITLES: Record<Rank, string> = {
  SSS: "особо опасен",
  SS: "крайне опасен",
  S: "опасен",
  A: "под наблюдением",
  B: "низкая угроза",
};
