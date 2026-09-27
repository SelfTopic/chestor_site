// Только факты из docs/CONTENT.md. Нет факта — нет строки.
export const OWNER = {
  name: "Self",
  gitName: "CheStor",
  role: "бэкенд · Python · TypeScript",
  country: "Россия",
  since: "апреля 2025",
  quote: "In code I trust, for it never lies or betrays — it simply executes.",
  links: {
    telegram: { href: "https://t.me/Self_topic", label: "@Self_topic" },
    github: { href: "https://github.com/SelfTopic", label: "SelfTopic" },
  },
} as const;

export type StackGroup = { title: string; items: readonly string[] };

export const STACK: readonly StackGroup[] = [
  {
    title: "Python",
    items: [
      "asyncio",
      "aiohttp",
      "pydantic v2",
      "pydantic-settings",
      "SQLAlchemy 2 (async)",
      "Alembic",
      "dependency-injector",
      "pytest",
      "ruff",
      "pyright",
      "Poetry",
      "PyPI",
    ],
  },
  {
    title: "Telegram",
    items: ["selfrotgram (свой)", "aiogram 3", "grammY", "Pyrogram", "Kurigram"],
  },
  { title: "Веб-бэкенд", items: ["Express 5", "FastAPI", "Flask"] },
  { title: "Данные", items: ["PostgreSQL", "Redis", "SQLite", "Drizzle ORM"] },
  {
    title: "TypeScript",
    items: ["Node.js", "Zod", "JWT", "Vitest", "ESLint/Prettier", "pnpm", "Next.js/React", "WebSocket (ws)", "VS Code Extension API"],
  },
  {
    title: "Инфраструктура",
    items: [
      "Docker Compose",
      "pg_dump → Google Drive (rclone)",
      "nginx / Caddy",
      "вебхуки",
      "GitHub Actions",
      "VPS",
      "systemd",
    ],
  },
  {
    title: "Медиа и речь",
    items: ["ffmpeg", "moviepy", "yt-dlp", "gallery-dl", "Vosk", "faster-whisper"],
  },
];

// Сообщения Self в его личном чате — сверху вниз.
export const SELF_MESSAGES = {
  hello: "Привет. Я Self, в git подписываюсь CheStor. Пишу бэкенд: Python — основной язык, TypeScript — второй.",
  why: "Юношеский максимализм не позволил сделать простой сайт со списком проектов. Поэтому здесь Telegram: слева диалоги, в них — проекты, бот, викторина и живой чат с настоящей группой.",
  loves:
    "Что люблю: Telegram Bot API — настолько, что написал к нему свой фреймворк. «Токийского гуля» — настолько, что написал по нему RPG-бота. И Павла Дурова — за образ жизни и философию.",
  stackIntro: "Стек — только то, что подтверждено кодом в репозиториях:",
  claude:
    "Код пишу вместе с Claude Code: CLAUDE.md в репозиториях, облачные сессии, а userbot-api — чтобы Claude проверял ботов в настоящем Telegram. Этот сайт собран так же.",
  since: "Первые репозитории — апрель 2025. Что было дальше — в канале «Проекты».",
  contacts: "Где меня найти:",
  now: "Сейчас в работе — последние коммиты в публичных репозиториях:",
} as const;

// Откуда собирать «Сейчас в работе» (публичные репозитории из docs/CONTENT.md).
export const ACTIVE_REPOS = [
  "chestor_bot",
  "selfrotgram",
  "chestor_site",
  "questions_ghoul_api",
  "userbot-api",
  "voice-player",
  "tiktok-userbot",
] as const;
