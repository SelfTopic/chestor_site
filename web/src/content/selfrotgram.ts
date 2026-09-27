// Всё — из README и docs/from-aiogram.md репозитория selfrotgram.
export const SR_LINKS = {
  github: "https://github.com/SelfTopic/selfrotgram",
  pypi: "https://pypi.org/project/selfrotgram/",
  fromAiogram: "https://github.com/SelfTopic/selfrotgram/blob/main/docs/from-aiogram.md",
  examples: "https://github.com/SelfTopic/selfrotgram/blob/main/docs/examples.md",
  showcase: "https://github.com/SelfTopic/selfrotgram_example_bot",
} as const;

export const SR_HERO = {
  kicker: "selfrotgram · Telegram Bot API для Python",
  title: "Типы говорят правду",
  lead: "Если хендлер обещает, что у сообщения есть текст, фильтр это проверил, а `message.text` в редакторе — `str`, а не `str | None`. Без `assert`, без `cast`, без скрытых аргументов.",
  status: "Альфа: 0.1.1–0.1.4 на PyPI, сентябрь 2026. Работает на реальном боте — chestor_bot.",
} as const;

export const ECHO_CODE = `class Echo(MessageHandler[BaseContext[TextMessage]]):  # обещаю: текст есть
    query = HasText()  # проверяю: текст есть

    async def handle(self) -> None:
        # text: str — проверять нечего
        await self.ctx.message.answer(self.ctx.message.text)`;

export const ECHO_BROKEN_CODE = `class Echo(MessageHandler[BaseContext[TextMessage]]):  # обещаю: текст есть
    query = None  # …но ничего не проверяю

    async def handle(self) -> None:
        # text: str? уже нет
        await self.ctx.message.answer(self.ctx.message.text)`;

export const ECHO_ERROR =
  "DefinitionError: NoGuarantee: в заголовке обещан TextMessage, но query None не гарантирует поля: text";

export const GUARANTEES: readonly { title: string; text: string }[] = [
  {
    title: "Фильтр гарантирует",
    text: "HasText() пропускает только сообщения с текстом. Фото без подписи до handle() не дойдёт.",
  },
  {
    title: "Заголовок обещает",
    text: "TextMessage в MessageHandler[…] — суженный тип: у него text: str. Таких типов 117, по одному на каждое необязательное поле.",
  },
  {
    title: "Библиотека сверяет",
    text: "Обещание и фильтр сравниваются при импорте. Разошлись — DefinitionError при запуске, а не AttributeError у пользователя.",
  },
];

export type CodePair = { title: string; note: string; aiogram: string; selfrot: string };

export const PAIRS: readonly CodePair[] = [
  {
    title: "Команда с аргументами",
    note: "Команда с другим числом аргументов просто не подходит — проверять руками нечего.",
    aiogram: `@router.message(Command("sum"))
async def sum_handler(message: Message, command: CommandObject):
    if not command.args or len(command.args.split()) != 2:
        await message.answer("Использование: /sum 2 3")
        return
    a, b = map(int, command.args.split())
    await message.answer(f"{a + b}")`,
    selfrot: `class Sum(MessageHandler[BaseContext[TextMessage]]):
    cmd = Command("sum", args_count=2)
    query = cmd

    async def handle(self):
        a, b = (int(x) for x in self.cmd.parse(self.ctx).args)
        await self.ctx.message.answer(f"{a + b}")`,
  },
  {
    title: "Типизированные аргументы",
    note: "Форма аргументов описана один раз. Ошибка ввода — CommandArgsError с готовой подсказкой .usage.",
    aiogram: `@router.message(Command("calc"))
async def calc(message: Message, command: CommandObject):
    try:
        one, operator, two = command.args.split()
        result = int(one) + int(two) if operator == "+" else ...
    except (AttributeError, ValueError):
        await message.answer("Использование: /calc 2 + 3")`,
    selfrot: `class CalcArgs(CommandArgs):
    one: int
    operator: Literal["+", "-", "*", "/"]
    two: int

class Calc(MessageHandler[BaseContext[TextMessage]]):
    cmd = Command("calc", CalcArgs)
    query = cmd

    async def handle(self):
        args = self.cmd.parse(self.ctx)   # args.one: int`,
  },
  {
    title: "Кнопка с данными",
    note: "Значение action проверяется при разборе, duel_id приходит уже числом.",
    aiogram: `class Duel(CallbackData, prefix="duel"):
    duel_id: int
    action: str

@router.callback_query(Duel.filter(F.action == "accept"))
async def accept(callback: CallbackQuery, callback_data: Duel):
    await callback.answer(f"Дуэль {callback_data.duel_id}")`,
    selfrot: `class Duel(CallbackPayload, prefix="duel"):
    duel_id: int
    action: Literal["accept", "decline"]

class Accept(CallbackQueryHandler[BaseContext[DataCallbackQuery]]):
    duel = Duel.filter(action="accept")
    query = duel

    async def handle(self):
        data = self.duel.parse(self.ctx)
        await self.ctx.callback_query.answer(f"Дуэль {data.duel_id}")`,
  },
  {
    title: "Многошаговый диалог",
    note: "Состояние знает тип своих данных: data.name — str, а не «может оказаться None».",
    aiogram: `class Form(StatesGroup):
    age = State()

@router.message(Form.age)
async def got_age(message: Message, state: FSMContext):
    data = await state.get_data()      # dict
    name = data.get("name")            # может оказаться None`,
    selfrot: `class AgeStep(BaseModel):
    name: str

class Form(States):
    age = State(AgeStep)

class GotAge(MessageHandler[BaseContext[TextMessage]]):
    query = InState(Form.age) & HasText()

    async def handle(self):
        data = await self.ctx.fsm.get(Form.age)   # AgeStep`,
  },
];

export const TREE_OUTPUT = `Dispatcher  (мидлвари: LoggingMiddleware)
└─ RootRouter
   ├─ StartRouter
   │  └─ Start     message: TextMessage            Command('start')
   └─ AdminRouter  (мидлвари: OnlyAdmins)
      ├─ BanUser   message: TextMessage            (FromUser(1, 2) & Command('ban', Ban))
      ├─ Anything  message                         без фильтра: ловит всё этого вида
      ├─ Never     message: TextMessage            HasText()  ! недостижим: выше Anything ...
      └─ Joined    chat_member: ChatMemberUpdated  MemberJoined()

Роутеров: 3 (без корня), хендлеров: 4. allowed_updates: chat_member, message`;

export const CHECK_OUTPUT = `Проверка src/bot: модулей 10, роутеров 3, хендлеров 6.
ошибка: src.bot.filters.oops: ModuleNotFoundError: No module named 'nonexistent_thing'
ошибка: src.bot.routers.broken: DefinitionError: NoGuarantee: в заголовке обещан TextMessage, но query None не гарантирует поля: text
предупреждение: src.bot.routers.admin: BanAgain недостижим: выше Ban тот же фильтр Command('ban')
предупреждение: src.bot.routers.admin: хендлер Forgotten нигде не подключён: добавьте его в handlers роутера
предупреждение: src.bot.routers.admin: роутер LostRouter не подключён: добавьте его в routers родителя ...
Итог: 2 ошибки, 4 предупреждения.`;

export const TERMINAL_SESSIONS: readonly { command: string; output: string }[] = [
  { command: "selfrot tree", output: TREE_OUTPUT },
  { command: "selfrot check", output: CHECK_OUTPUT },
];

export const SR_FACTS: readonly { value: string; label: string }[] = [
  { value: "10.3", label: "версия Bot API" },
  { value: "400", label: "типов из спецификации" },
  { value: "185", label: "методов" },
  { value: "117", label: "суженных типов" },
  { value: "26", label: "видов хендлеров" },
  { value: "200+", label: "тестов" },
];

export const SR_FEATURES: readonly string[] = [
  "Типы, методы и фильтры генерируются из официальной спецификации: вышел новый Bot API — перегенерировали.",
  "Всё, что нужно хендлеру, лежит в self.ctx. Нет аргументов, появляющихся по имени, нет прокси F.",
  "CommandArgs, AnyCommand, Reply[T], отложенные вызовы defer и after_handle, вебхуки, скачивание файлов.",
  "Типизированные FSM-диалоги и callback_data, pressed_by — «нажать может только владелец».",
  "Лимиты Telegram проверяются до отправки: 64 байта callback_data, 8 кнопок в ряду.",
  "CI на Python 3.11–3.13: тесты, pyright, сверка сгенерированного кода.",
];

export const SR_MISSING: readonly string[] = [
  "Локализации и сцен.",
  "Готового хранилища FSM в Redis — есть интерфейс Storage из трёх методов.",
  "Загрузки файлов внутри альбомов и сборщика reply-клавиатур.",
  "Экосистемы и обкатки тысячами ботов — aiogram старше и больше, это честно.",
];

export const INSTALL = ["pip install selfrotgram", "poetry add selfrotgram", "selfrot init"] as const;

export type ChannelPostData = { id: string; dated: string; title: string; text: string; code?: string; cta?: { href: string; label: string } };

// Посты канала selfrotgram в оболочке сайта; всё подробное — на /selfrotgram.
export const SR_CHANNEL_POSTS: readonly ChannelPostData[] = [
  {
    id: "rewrite",
    dated: "сен 2026",
    title: "Переписан с нуля",
    text: "Первые наброски — апрель 2025. В сентябре 2026 библиотека переписана с нуля: кодогенерация из официальной спецификации Bot API 10.3 — 400 типов, 185 методов, 26 видов хендлеров.",
  },
  {
    id: "echo",
    dated: "сен 2026",
    title: "Типы говорят правду",
    text: "Если хендлер обещает, что у сообщения есть текст, фильтр это проверил. Несоответствие фильтра и типа — ошибка при импорте, а не в проде.",
    code: ECHO_CODE,
  },
  {
    id: "pypi",
    dated: "сен 2026",
    title: "На PyPI",
    text: "Версии 0.1.1–0.1.4, статус альфа, 200+ тестов, CI на Python 3.11–3.13. chestor_bot уже переехал: целиком, с aiogram 3.",
    cta: { href: "/selfrotgram", label: "Всё о selfrotgram →" },
  },
];
