# chestor.site

Личный сайт CheStor (Self) — не список проектов, а Telegram-клиент в браузере: диалоги
вместо разделов, канал с проектами, бот-викторина по «Токийскому гулю» и Live-чат,
синхронный с настоящей Telegram-группой. Две темы: «Человек» и «Гуль».

```text
web/    Next.js (App Router, TypeScript) — сам сайт
chat/   Python 3.12, aiohttp + selfrotgram — Live-чат, капча и квиз
docs/   факты (CONTENT.md), план (ROADMAP.md), деплой (DEPLOY.md)
```

## Запуск локально

Нужны Node.js 22 с pnpm и Python 3.12 с Poetry.

```bash
# сервис чата: демо-режим без Telegram, вопросы квиза из фикстуры
cd chat
poetry install
CHAT_MODE=mock poetry run python -m chestor_chat     # http://localhost:8080/chat/health

# сайт (в другом терминале); /chat/* проксируется на localhost:8080
cd web
pnpm install
pnpm dev                                            # http://localhost:3000
```

Настоящий Telegram: `CHAT_MODE=telegram BOT_TOKEN=... CHAT_ID=... ENV=DEV` — бот
работает long polling. Остальные переменные — в `chat/.env.example`.

Всё вместе в Docker (web, chat, redis): `docker compose up -d --build`, переменные —
в `chat/.env`. Как выкатить на chestor.site рядом с существующими сервисами — `docs/DEPLOY.md`.

## Проверки

```bash
cd web  && pnpm lint && pnpm typecheck && pnpm test && pnpm build
cd chat && poetry run ruff check . && poetry run pyright && poetry run pytest
cd chat && poetry run selfrot check --strict --package chestor_chat/telegram chestor_chat.telegram.bot:ChatDispatcher

# глазами: скриншоты 1440/390 в обеих темах и аудит доступности (нужен запущенный сайт)
cd web && node scripts/screenshots.mjs http://localhost:3000 / /c/live /bot
cd web && node scripts/a11y.mjs
```

Те же проверки запускает GitHub Actions на каждый push и pull request.
