// Досье chestor_bot. Механики — из BATTLE_DESIGN/BATTLE_ENGINE/ECONOMY и текстов бота
// (src/bot/dialogs/*.yaml в репозитории), цифры — из docs/CONTENT.md.
export const BOT_REPO = "https://github.com/SelfTopic/chestor_bot";

export const BOT_HERO = {
  caseNo: "Дело № SSS-001",
  object: "chestor_bot",
  rank: "SSS",
  verdict: "Особо опасен",
  lead: "RPG-бот в Telegram по «Токийскому гулю». Гули с голодом, кагуне и смертью, честный боевой движок и своя экономика.",
  status: "Версия 1.0.0 — игровой цикл закрыт.",
} as const;

export const LIFE_CYCLE = ["голод", "смерть", "регенерация", "прокачка", "бои"] as const;

export const DOSSIER_FIELDS: readonly { label: string; value: string; redacted?: boolean }[] = [
  { label: "Среда обитания", value: "Telegram-чаты, вебхук на chestor.site" },
  { label: "Язык", value: "Python 3.11–3.14" },
  { label: "Фреймворк", value: "selfrotgram (с сентября 2026), до этого aiogram 3" },
  { label: "Хранилище", value: "PostgreSQL 16, 22 миграции Alembic" },
  { label: "Юзернейм прод-бота", value: "засекречено", redacted: true },
];

export type HungerTier = { name: string; range: string; from: number; to: number; falling: string; rising: string };

export const HUNGER_TIERS: readonly HungerTier[] = [
  { name: "Смертельный голод", range: "0–24%", from: 0, to: 25, falling: "×0.1", rising: "×0.5" },
  { name: "Сильный голод", range: "25–49%", from: 25, to: 50, falling: "×0.6", rising: "×1.6" },
  { name: "Лёгкий голод", range: "50–74%", from: 50, to: 75, falling: "×0.9", rising: "×1.1" },
  { name: "Не голоден", range: "75–100%", from: 75, to: 100, falling: "×1.0", rising: "×1.0" },
];

export const HUNGER_NOTES = [
  "Голод тает сам: ориентир — 4 раза в сутки по 4%, полностью голодным гуль станет через неделю реального времени.",
  "«Падающие» статы — ловкость, скорость, регенерация. «Растущие» — сила и кагуне: голод злит.",
  "Последний тир осознанно ломает рост: неделями голодающий гуль теряет контроль над RC-клетками. Это коллапс, а не адреналин.",
  "Ушёл в минус — смерть. Переживает её только счётчик смертей.",
] as const;

export type KaguneType = { name: string; organ: string; style: string; stats: string };

export const KAGUNE: readonly KaguneType[] = [
  { name: "Укаку", organ: "плечи", style: "Скорость и частые лёгкие удары. Минус — низкая выносливость.", stats: "скорость ×1.8" },
  { name: "Коукаку", organ: "лопатки", style: "Мощный физический удар. Минус — низкая скорость.", stats: "сила ×1.6, скорость ×1.3" },
  {
    name: "Ринкаку",
    organ: "поясница",
    style: "Выносливость и регенерация, явных слабостей почти нет.",
    stats: "ловкость ×1.3, регенерация ×1.8, скорость ×1.5, здоровье ×1.5",
  },
  {
    name: "Бикаку",
    organ: "копчик",
    style: "Понемногу всех усилений сразу — универсал.",
    stats: "сила ×1.5, ловкость ×1.4, регенерация ×1.4, скорость ×1.4, здоровье ×1.4",
  },
];

export const KAGUNE_LOTTERY =
  "Первый кагуне выпадает случайно. Это лор, а не лень: до рождения гены не выбирают. Не нравится — умри и снова полагайся на лотерею.";

export const BATTLE_RULES: readonly { title: string; text: string }[] = [
  {
    title: "Чистый домен",
    text: "Боевой движок не знает ни про базу, ни про Telegram: на входе статы, на выходе лог событий. Текст в чате — лишь один способ этот лог отрисовать.",
  },
  {
    title: "Ограниченное число раундов",
    text: "Старая версия умела зависнуть навсегда, если оба гуля были запредельно ловкими. Теперь бой — фиксированное число раундов, победитель без нокаута определяется по остатку HP.",
  },
  {
    title: "Уклонение 5–95%",
    text: "Шанс увернуться зажат между полом и потолком и считается парно, относительно соперника. Неуязвимых билдов нет.",
  },
  {
    title: "Физика или кагуне",
    text: "Первый удар всегда физический, дальше шанс физического падает на 10 п.п. за удар — бой скатывается в кагуне. Поднятое кагуне блокирует 45–75% физики.",
  },
  {
    title: "Засада на охоте",
    text: "«Сожрать человека» можно раз в сутки: +5–25% к голоду. Иногда из темноты выходит другой гуль — и ужин приходится отбивать.",
  },
  {
    title: "Моб раз в 10 минут",
    text: "Статы моба — твои, умноженные на случайное 0.5–2. Голодный встречает моба опаснее, чем по профилю: это стимул есть, а не баг.",
  },
];

export const LEVEL_FORMULA = {
  formula: "прогресс += 1% × (сила соперника / своя сила)",
  text: "Уровень хранится в процентах, а не в сыром опыте: равный соперник даёт 1%, вдесятеро слабее — 0,1%. Фармить своего твинка бессмысленно, а сильного — выгодно.",
} as const;

export const ECONOMY: readonly { name: string; text: string }[] = [
  { name: "CheSton", text: "Обычные деньги: кофе, сломанные пальцы («щёлк»), викторина, мобы, лотерея. Тратятся на статы и рост кагуне." },
  {
    name: "RC-клетки",
    text: "Не валюта, а избыток RC в теле. Добываются поеданием побеждённых гулей и изредка с мобов. Нужны для новых типов кагуне и какуджи.",
  },
];

export type BotCommand = { command: string; text: string };
export type CommandGroup = { title: string; commands: readonly BotCommand[] };

export const COMMANDS: readonly CommandGroup[] = [
  {
    title: "Стать гулем",
    commands: [
      { command: "растить кагуне", text: "родиться гулем или прокачать кагуне" },
      { command: "профиль", text: "статы, кагуне, счётчики" },
      { command: "распрофиль", text: "расовый профиль, /race_profile" },
      { command: "/kagune", text: "справка по типам кагуне" },
    ],
  },
  {
    title: "Выжить",
    commands: [
      { command: "голод", text: "тир голода и эффективные статы" },
      { command: "реген", text: "сколько до полного здоровья" },
      { command: "сожрать человека", text: "раз в сутки, иногда с засадой" },
      { command: "боевая мощь", text: "статы вне боя и в бою" },
    ],
  },
  {
    title: "Драться",
    commands: [
      { command: "бить моба", text: "бой с мобом, коротко «бм»" },
      { command: "дуэль", text: "бой с другим гулем" },
      { command: "качаться", text: "купить статы (в личке)" },
    ],
  },
  {
    title: "Деньги",
    commands: [
      { command: "щёлк", text: "сломать палец за CheSton" },
      { command: "пить кофе", text: "кофе из Антейку за CheSton" },
      { command: "бал", text: "баланс; «топ бал» — самые богатые" },
      { command: "перевести", text: "перевод CheSton, он же /transfer" },
      { command: "депнуть", text: "лотерея: депнуть красный 500" },
    ],
  },
  {
    title: "Развлечься",
    commands: [
      { command: "/quiz", text: "вопрос из Ghoul Quiz API" },
      { command: "вордли", text: "wordle, он же /wordle" },
      { command: "/anime", text: "гифки из аниме" },
      { command: "/help", text: "все команды" },
    ],
  },
];

export type DemoLine = { from: "user" | "bot"; text: string };
export type Demo = { title: string; lines: readonly DemoLine[] };

// Реплики бота — дословно из его текстов; числа в них условные.
export const DEMOS: readonly Demo[] = [
  {
    title: "Рождение",
    lines: [
      { from: "user", text: "растить кагуне" },
      {
        from: "bot",
        text: "🐣 Добро пожаловать в пищевую цепочку, Гость. Ты больше не человек — ты гуль. Кагуне: Ринкаку.",
      },
      { from: "user", text: "пить кофе" },
      { from: "bot", text: "☕️ Антейку наливает — ты пьёшь. Чёрный, как твоё будущее.\n\n💸 CheSton: +40\n☕️ Всего выпито: 1" },
    ],
  },
  {
    title: "Ужин с засадой",
    lines: [
      { from: "user", text: "сожрать человека" },
      { from: "bot", text: "🐺 Облом: на твоего человека уже слюни пускает другой гуль. Мочи его!" },
      {
        from: "bot",
        text: "──── Раунд 1 ────\n🔸 Гость наносит удар — 34 урона\n🐺 Моб промахивается\n❤️ Моб: 120 → 86 (-34 урон)",
      },
      { from: "bot", text: "🍽 Мясо свежее, крики вкусные.\n\n🍖 Голод: +18%, теперь 81%\n🥩 Съедено людей: 1" },
    ],
  },
  {
    title: "Голод",
    lines: [
      { from: "user", text: "голод" },
      {
        from: "bot",
        text: "🍖 Голод: 42% (сильный голод)\n\n📉 Падающие статы (ловкость/скорость/регенерация/здоровье) сейчас: ×0.6\n📈 Растущие статы (сила/кагуне) сейчас: ×1.6",
      },
      { from: "bot", text: "🍖 Голод 25%. Кишки уже урчат — иди жри человека." },
    ],
  },
];

export const BOT_FACTS: readonly { value: string; label: string }[] = [
  { value: "1.0.0", label: "версия" },
  { value: "659", label: "тестов на настоящем Postgres" },
  { value: "~360", label: "коммитов" },
  { value: "22", label: "миграции Alembic" },
  { value: "~42 тыс.", label: "строк" },
];

export const BOT_STACK = [
  "Python 3.11–3.14",
  "selfrotgram",
  "SQLAlchemy 2 async",
  "PostgreSQL 16",
  "Alembic",
  "dependency-injector",
  "Docker Compose",
  "ежедневные бэкапы в облако",
] as const;

export const BOT_ENGINEERING = [
  "Тесты поднимают одноразовый Postgres в Docker и подменяют Telegram фейковым HTTP-сервером.",
  "Тексты бота — YAML с горячей перезагрузкой и сгенерированным типизированным деревом: опечатка в ключе не доживает до прода.",
  "Дизайн-документы живут рядом с кодом: BATTLE_DESIGN, BATTLE_ENGINE, ECONOMY, REGENERATION.",
  "В сентябре 2026 бот целиком переехал с aiogram 3 на selfrotgram.",
] as const;
