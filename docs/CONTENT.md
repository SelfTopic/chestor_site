# Факты для сайта

Проверено по репозиториям https://github.com/SelfTopic 2026-09-28. Это единственный
источник фактов о владельце: чего здесь нет — того на сайте нет (или нейтрально + вопрос
владельцу). Репозитории пользователя `Youtski1` — не владельца, не упоминать.

Детали любого проекта можно дочитать в его репозитории (README, `*.md`, код) — но цифры
брать отсюда или считать самому по репозиторию, а не придумывать.

## Владелец

- GitHub: `SelfTopic` (https://github.com/SelfTopic), подпись в git — CheStor, имя в профиле — Self.
- Telegram: https://t.me/Self_topic
- Россия. Бэкенд-разработчик, основной язык Python, второй — TypeScript.
- Первые репозитории — апрель 2025. Любит «Токийского гуля», Telegram Bot API, Павла Дурова.
- Цитата из профиля: «In code I trust, for it never lies or betrays — it simply executes.»
- Реального имени, возраста, учёбы/работы на сайте нет (не выдумывать).
- Email публиковать только если владелец разрешит (вопрос в ROADMAP).
- Пишет вместе с Claude Code: CLAUDE.md в репозиториях, облачные сессии, userbot-api для живых проверок ботов.

## Стек (подтверждён кодом)

- **Python:** asyncio, aiohttp, pydantic v2, pydantic-settings, SQLAlchemy 2 (async), Alembic,
  dependency-injector, pytest, ruff, pyright, Poetry, публикация на PyPI.
- **Telegram:** свой фреймворк selfrotgram; раньше aiogram 3; grammY (TS); юзерботы на
  Pyrogram / Kurigram.
- **Веб-бэкенд:** Express 5, FastAPI, Flask.
- **Данные:** PostgreSQL, Redis, SQLite; Drizzle ORM.
- **TypeScript:** Node.js, Zod, JWT, Vitest, ESLint/Prettier, pnpm; Next.js/React; WebSocket (ws);
  VS Code Extension API.
- **Инфраструктура:** Docker Compose (healthchecks, разовый сервис миграций), бэкапы
  pg_dump → Google Drive через rclone, nginx / Caddy, вебхуки, GitHub Actions (CI, PyPI, GHCR),
  VPS, systemd.
- **Медиа и речь:** ffmpeg, moviepy, yt-dlp, gallery-dl, Vosk, faster-whisper.

## Экосистема chestor.site

```
selfrotgram (PyPI) ──► chestor_bot ◄── ghoul-quiz-lib ──► questions_ghoul_api (chestor.site/api)
       ▲                    ▲
selfrotgram_example_bot   userbot-api (живые тесты ботов в Telegram)
```

## Проекты

Ранги CCG — предложение для раздела «Проекты» (SSS самый опасный). Можно менять.

### chestor_bot — ранг SSS
https://github.com/SelfTopic/chestor_bot · Python · MIT
RPG-бот в Telegram по «Токийскому гулю».
- Гули со статами (сила, ловкость, скорость, здоровье, регенерация), голодом и тирами голода,
  смертью и возрождением (счётчик смертей переживает смерть).
- Кагуне: 4 типа (укаку, коукаку, ринкаку, бикаку), первый выпадает случайно — «генетическая
  лотерея» (осознанное лорное решение). Прокачка кагуне, уровни, `level_progress` в процентах
  вместо сырого опыта (чтобы опыт нельзя было фармить фиксированными боями).
- Боевой движок — чистый домен без БД и Telegram: дуэли, бои с мобами, засада моба во время
  «поесть человека», формулы урона/уклонения/побега/инициативы.
- Экономика: CheSton (деньги) и RC-клетки (лорная «валюта» — избыток RC в теле; за победу и
  поедание гуля).
- Ещё: переводы, лотерея, wordle, викторина (через Ghoul Quiz API), RP-команды, топы,
  нарезка аниме-гифок, модерация чата, админ-команды, уведомления о голоде.
- Тексты бота — YAML с горячей перезагрузкой и сгенерированным типизированным деревом.
- Цифры: версия 1.0.0 («игровой цикл закрыт: голод → смерть → регенерация → прокачка → бои»),
  ~360 коммитов, 659 тестов (настоящий Postgres в Docker, фейковый Telegram), 22 миграции
  Alembic, ~42 тыс. строк. Дизайн-документы: BATTLE_DESIGN, BATTLE_ENGINE, ECONOMY, REGENERATION.
- История: написан на aiogram 3, в сентябре 2026 целиком перенесён на selfrotgram.
- Стек: Python 3.11–3.14, selfrotgram, SQLAlchemy 2 async, PostgreSQL 16, Alembic,
  dependency-injector, Docker Compose, ежедневные бэкапы в облако. Вебхук на chestor.site.
- Юзернейм прод-бота в репозитории не указан (в чатах работает `@chestor_chat_bot`) — уточнить
  у владельца, прежде чем давать ссылку.

### selfrotgram — ранг SS
https://github.com/SelfTopic/selfrotgram · https://pypi.org/project/selfrotgram/ · Python · MIT
Асинхронная библиотека для Telegram Bot API (aiohttp + pydantic), где «типы говорят правду».
- Слоган из README: если хендлер обещает, что у сообщения есть текст, фильтр это проверил, а
  `message.text` в редакторе — `str`, а не `str | None`. Без `assert`, без `cast`. Несоответствие
  фильтра и типа — ошибка при импорте, а не в проде.
- Ничего неявного: всё, что нужно хендлеру, лежит в `self.ctx`; нет магических аргументов по имени.
- Кодогенерация из официальной спецификации: Bot API 10.3, 400 типов, 185 методов, 117 суженных
  типов `<Поле>Message`, 26 видов хендлеров.
- Типизированные FSM-диалоги и `callback_data`, `CommandArgs` (аргументы команд как модель),
  `AnyCommand`, `Reply[T]`, отложенные вызовы (`defer`, `after_handle`), вебхуки, скачивание файлов.
- CLI: `selfrot init` (заготовка проекта), `selfrot add router`, `selfrot tree` (дерево роутеров,
  находит недостижимые хендлеры), `selfrot check --strict` (все ошибки разом, для CI).
- Вдохновение: aiogram (охват и структура) + grammY (эргономика контекста).
- Версии на PyPI: 0.1.1–0.1.4 (сентябрь 2026), статус альфа, 200+ тестов, CI на Python 3.11–3.13
  (тесты, pyright, сверка сгенерированного кода).
- Пример из README:

```python
class Echo(MessageHandler[BaseContext[TextMessage]]):    # обещаю: у сообщения есть текст
    query = HasText()                                    # проверяю: текст есть

    async def handle(self) -> None:
        await self.ctx.message.answer(self.ctx.message.text)   # text: str, проверять нечего
```

- Пример `selfrot tree` (для демо-терминала):

```
$ selfrot tree
Dispatcher  (мидлвари: LoggingMiddleware)
└─ RootRouter
   ├─ StartRouter
   │  └─ Start     message: TextMessage            Command('start')
   └─ AdminRouter  (мидлвари: OnlyAdmins)
      ├─ BanUser   message: TextMessage            (FromUser(1, 2) & Command('ban', Ban))
      ├─ Anything  message                         без фильтра: ловит всё этого вида
      ├─ Never     message: TextMessage            HasText()  ! недостижим: выше Anything ...
      └─ Joined    chat_member: ChatMemberUpdated  MemberJoined()

Роутеров: 3 (без корня), хендлеров: 4. allowed_updates: chat_member, message
```

- Пары «было в aiogram / стало» — в https://github.com/SelfTopic/selfrotgram/blob/main/docs/from-aiogram.md
- Витрина: https://github.com/SelfTopic/selfrotgram_example_bot — показательный бот на все приёмы.

### Questions Ghoul API — ранг S
https://github.com/SelfTopic/questions_ghoul_api · TypeScript · работает на https://chestor.site/api
REST API с базой вопросов викторины по «Токийскому гулю».
- Гостевой доступ (10 вопросов в час, без ответов) и вход по 6-значному коду из письма.
- JWT access (7 дней) + одноразовые refresh-токены (30 дней, ротация); повторное предъявление
  использованного refresh-токена считается утечкой и отзывает всю сессию.
- Лимиты на Redis по IP и по проверенному субъекту; в БД хранится только sha256 refresh-токенов.
- Стек: Node.js 24, Express 5, PostgreSQL + Drizzle, Redis, Zod, JWT, Nodemailer, Vitest, Docker.
- Эндпоинты: `GET /api/access_token`, `GET /api/quiz/random`, `POST /api/quiz/answer`,
  `GET /api/health`. Ответ вопроса: `{ id, question, answer_options[4], answer_group }`.

**ghoul-quiz-lib** — https://github.com/SelfTopic/questions_ghoul_api_lib · Python
Асинхронный клиент к API: вход по коду, автообновление токенов, гостевой режим, сохранение
сессий, типизированные модели; две консольные викторины (4 режима: на время, выживание,
челлендж с множителем) и CLI `ghoul-quiz-register`. Используется в chestor_bot.

### userbot-api — ранг A
https://github.com/SelfTopic/userbot-api · Python
HTTP API над сессиями тестовых Telegram-аккаунтов (Pyrogram): написать боту, дождаться ответа,
нажать inline-кнопку, несколько аккаунтов для команд на двоих. Сделан, чтобы Claude Code в
облачной сессии мог проверять бота в настоящем Telegram. Видит только разрешённые чаты.
Docker, Caddy/nginx, тесты.

### voice-player — ранг A
https://github.com/SelfTopic/voice-player · Python
Голосовой ассистент «Джарвис» для KDE Plasma: быстрые команды («пауза», «дальше», «терминал»)
офлайн через Vosk; свободные запросы («Джарвис, включи …») через faster-whisper с поиском
музыки в Telegram и видео на YouTube; управление окнами (kdotool), громкостью, MPRIS-плеерами.
Установка одним `install.sh`, systemd-сервис.

### tiktok-userbot — ранг B
https://github.com/SelfTopic/tiktok-userbot · Python
Юзербот на Kurigram: в заданном чате отвечает на ссылки TikTok скачанным видео или слайдшоу.
Три способа скачать по очереди (yt-dlp → gallery-dl → tikwm), раскрытие коротких ссылок,
автообновление загрузчиков, вход по QR, образ в GHCR через GitHub Actions.

### VS Code Timer — ранг B
Три связанных репозитория (июль 2025): https://github.com/SelfTopic/vscode-timer-extension
(расширение VS Code: время сессии и общее, статус-бар, SQLite),
https://github.com/SelfTopic/vscode-timer-api (Express + SQLite),
https://github.com/SelfTopic/vscode-timer-site (Next.js, таблица участников).

### Расписание ВСГУТУ — ранг B
https://github.com/SelfTopic/rasp_rest_api (Flask: парсит расписание Восточно-Сибирского
государственного университета технологий и управления и рисует его картинкой, Docker) +
https://github.com/SelfTopic/rasp_telegram_bot (aiogram 3: `/tod`, `/tom`, `/set_group`).

### Хакатон: VK Mini App «Университет третьего возраста» — ранг B
https://github.com/SelfTopic/yopta_vk_mini_app_hackathon · бэкенд на FastAPI, SQLAlchemy,
PostgreSQL, dependency-injector, Docker. Образовательное пространство для людей пенсионного и
предпенсионного возраста во ВКонтакте.

### RAS Interpreter — ранг B (первые шаги)
https://github.com/SelfTopic/ras_interpreter · Python, апрель 2025
Интерпретатор собственного языка RAS (`local nameVar :type: << value #`): лексер, ключевые слова.

### Прочее (мелким списком или не показывать)
- `my_site_next` + `websocket_my_site_server` + `jokes_api_express` — прошлая версия
  сайта-визитки (Next.js, чат на WebSocket, API шуток), июнь 2025.
- `self_topic_bot` — бот-модератор чата (grammY, Drizzle, PostgreSQL).
- `true_hax0r_bot_python` — бот на aiogram с i18n; `nu_nixua_sebe_bot` — бот клана в CS:Source.

## Хронология

- **Апрель 2025** — первые репозитории: интерпретатор RAS, бот на grammY, первые наброски selfrotgram.
- **Лето 2025** — TypeScript: Express API, Next.js, VS Code Timer, первый сайт с WebSocket-чатом.
- **Осень 2025** — Python-бэкенды: расписание ВСГУТУ, хакатон VK, старт chestor_bot.
- **2026** — chestor_bot растёт до боевого движка и экономики; Questions Ghoul API.
- **Сентябрь 2026** — selfrotgram переписан с нуля и выходит на PyPI, chestor_bot переезжает на
  него и получает версию 1.0.0 (в этом месяце больше 200 коммитов), voice-player,
  userbot-api, tiktok-userbot.
