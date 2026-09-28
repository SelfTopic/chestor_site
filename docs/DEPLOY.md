# Деплой chestor.site

Инструкция для владельца. Сам деплой из облачной сессии не выполнялся — всё ниже проверено
только локально (сборка образа `web`, тесты `chat`).

## Что где работает

```text
                ┌─────────────── nginx (TLS, chestor.site) ───────────────┐
 /api/…         │ → questions_ghoul_api (уже есть, не трогаем)            │
 /webhook…      │ → chestor_bot (уже есть, не трогаем)                    │
 /userbot…      │ → userbot-api (уже есть, не трогаем)                    │
 /chat/telegram/│ → chat :8091   вебхук бота Live-чата                    │
 /chat/ws       │ → chat :8090   WebSocket (Upgrade)                      │
 /chat/         │ → chat :8090   HTTP API чата и капчи                    │
 /              │ → web  :3000   Next.js                                  │
                └─────────────────────────────────────────────────────────┘
 chat ── redis (история, лимиты, баны, пропуска капчи)
```

Всё поднимает `docker-compose.yml` в корне: `web`, `chat`, `redis`. Порты слушают только
`127.0.0.1`, наружу смотрит nginx. Чат на хосте — `8090` (HTTP/WS) и `8091` (вебхук), потому что
`8080` занят userbot-api; поменять можно через `CHAT_HOST_PORT` / `CHAT_WEBHOOK_HOST_PORT`.

## 1. Бот для Live-чата

1. В @BotFather создать бота (или взять существующего, **не** прод-`chestor_bot`) и выключить
   ему privacy mode: `/setprivacy` → Disable. Иначе бот в группе видит только команды.
2. Добавить бота в группу и дать права администратора (достаточно «удалять сообщения»:
   так Telegram гарантированно шлёт ему все сообщения).
3. Узнать id группы (`-100…`): например, переслать сообщение из группы @userinfobot или
   посмотреть `GET /chats` в userbot-api.

## 2. Переменные окружения

`chat/.env` (образец — `chat/.env.example`, в git не коммитится):

| Переменная | Прод | Зачем |
|---|---|---|
| `CHAT_MODE` | `telegram` | `mock` — демо без Telegram |
| `ENV` | `PROD` | не `DEV` → вебхук вместо поллинга |
| `BOT_TOKEN` | токен из BotFather | |
| `BOT_USERNAME` | юзернейм без `@` | такой ник на сайте будет занят |
| `CHAT_ID` | `-100…` | группа Live-чата |
| `WEBHOOK_URL` | `https://chestor.site/chat/telegram/<случайная-строка>` | путь целиком уходит в nginx |
| `WEBHOOK_SECRET` | 32+ случайных символа `[A-Za-z0-9_-]` | Telegram шлёт его заголовком |
| `WEBHOOK_PORT` | `8081` | порт сервера вебхука внутри контейнера |
| `REDIS_URL` | задаётся в compose | без него всё в памяти процесса |
| `IP_HASH_SALT` | 32+ случайных символа | IP хранится только как хэш с солью |
| `PASS_SECRET` | 32+ случайных символа | подпись пропуска капчи |
| `TRUST_PROXY` | `1` | брать адрес клиента из `X-Real-IP` от nginx |
| `SHOW_MEDIA` | `0` (по умолчанию) или `1` | `1` — фото и стикеры из группы на сайте; `0` — только подписи `[фото]`, `[стикер]` |
| `GHOUL_QUIZ_EMAIL` | email владельца в Ghoul Quiz | живые вопросы капчи |
| `GHOUL_QUIZ_API_URL` | `https://chestor.site/api` | по умолчанию так и есть |

Секреты: `openssl rand -hex 32`. Вне `DEV` сервис не стартует без `IP_HASH_SALT`,
`PASS_SECRET`, `WEBHOOK_URL`, `WEBHOOK_SECRET` — это сделано нарочно.

## 3. Запуск

```bash
git clone https://github.com/SelfTopic/chestor_site && cd chestor_site
cp chat/.env.example chat/.env && $EDITOR chat/.env
docker compose up -d --build
docker compose ps                    # все три сервиса healthy
curl -s 127.0.0.1:8090/chat/health   # {"ok": true}
```

Блок «Сейчас в работе» в диалоге Self берёт публичные коммиты GitHub при сборке и затем
раз в час обновляется сам (ISR, `/` и `/c/self` перегенерируются в фоне). Без токена —
до 60 запросов в час к API, хватает. GitHub недоступен — блок скрыт до следующей попытки.

Образ `web` вшивает адрес чата для rewrites при сборке (`CHAT_BACKEND_URL`, по умолчанию
`http://chat:8080`). За nginx это не важно: `/chat/` он отдаёт в `chat` сам.

## 4. Вход в Ghoul Quiz (один раз)

Капча и CCG Checkpoint берут вопросы с `chestor.site/api`. Гостю API не отдаёт правильные
ответы, поэтому нужна пользовательская сессия. Без неё сервис работает на резервной колоде
из `chat/tests/fixtures/quiz_questions.json`, а интерфейс это честно подписывает.

```bash
docker compose run --rm -it chat ghoul-quiz-register --email you@example.com
# ввести 6-значный код из письма; сессия ляжет в volume ghoul-quiz
# (GHOUL_QUIZ_TOKEN_PATH=/data/ghoul_quiz/tokens.json), refresh-токены обновляются сами
echo "GHOUL_QUIZ_EMAIL=you@example.com" >> chat/.env
docker compose up -d chat
```

Refresh-токен живёт 30 дней с продлением: пока сайт открывают хотя бы раз в месяц, входить
заново не нужно. Если в логах `SessionExpiredError` — повторить команду выше.

## 5. nginx

Добавить в существующий `server { … chestor.site … }` **рядом** с локейшенами `/api`,
`/webhook…`, `/userbot` (их не менять). nginx выбирает самый длинный префикс, поэтому
порядок блоков не важен.

```nginx
# в http { … }, если ещё нет
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

# внутри server { … }
location /chat/telegram/ {
    proxy_pass http://127.0.0.1:8091;          # путь сохраняется целиком
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location = /chat/ws {
    proxy_pass http://127.0.0.1:8090;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 1h;                      # сервер шлёт ping раз в 30 с
}

location /chat/ {
    proxy_pass http://127.0.0.1:8090;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    client_max_body_size 16k;
}

location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

`nginx -t && systemctl reload nginx`. Проверка:

```bash
curl -s https://chestor.site/chat/health
curl -sI https://chestor.site/ | head -1
```

Вебхук сервис ставит сам при старте (`setWebhook` с `secret_token`). Если бот раньше
работал поллингом где-то ещё — остановить тот экземпляр, иначе будет `409 Conflict`.

## 6. Проверка после запуска

1. Открыть `/c/live` — в шапке «синхронно с Telegram», без жёлтой плашки демо.
2. Написать в группу из Telegram — сообщение появляется на сайте без перезагрузки.
3. На сайте: ник → вопрос CCG → отправить. В группе бот пишет `Ник — текст` (ник жирным).
4. Ответить в группе на это сообщение `/ban` от админа → с сайта больше не отправить.
   `/unban` ответом — снова можно. `/mute_site 10` — приём с сайта выключен на 10 минут,
   `/mute_site 0` — включён.

## Логи и откат

```bash
docker compose logs -f chat          # токен бота в логах не печатается
docker compose logs -f web
git checkout <прошлый коммит> && docker compose up -d --build
```

Redis хранит историю (последние 100 сообщений), баны и счётчики лимитов в volume
`redis-data`; его можно удалить без последствий для Telegram-группы.
