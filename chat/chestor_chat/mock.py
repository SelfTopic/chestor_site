import asyncio
import contextlib
import itertools
import random
import time

from .models import IncomingMessage
from .services.chat import ChatService

MEMBERS = ("Тока", "Хинами", "Нишики", "Ута", "Банджо", "Итори")

LINES = (
    "кто-нибудь пил кофе в Антейку сегодня?",
    "1000-7… опять считаю",
    "маски у Уты всё ещё лучшие",
    "CCG шныряют по 20-му району, осторожнее",
    "кагуне чешется, это нормально?",
    "кто в рейд на мобов?",
    "у меня голод 30%, ищу человека",
    "это демо-режим, я не настоящий",
)

REPLIES = (
    "согласен, {nick}",
    "{nick}, ты гуль или человек?",
    "о, {nick} с сайта пишет",
    "{nick}, кофе будешь?",
    "ха, {nick}",
)


# CHAT_MODE=mock: фейковая группа и собеседники, чтобы разрабатывать интерфейс без Telegram.
class MockGroup:
    def __init__(
        self, rng: random.Random | None = None, chatter_every: tuple[float, float] = (25, 70)
    ) -> None:
        self._ids = itertools.count(1_000_000)
        self._rng = rng or random.Random()
        self._every = chatter_every
        self._task: asyncio.Task[None] | None = None
        self._pending: set[asyncio.Task[None]] = set()
        self.chat: ChatService | None = None

    async def send(self, nick: str, text: str) -> int:
        message_id = next(self._ids)
        if self.chat is not None and self._rng.random() < 0.6:
            task = asyncio.create_task(self._reply(nick, text, message_id))
            self._pending.add(task)
            task.add_done_callback(self._pending.discard)
        return message_id

    async def _reply(self, nick: str, text: str, message_id: int) -> None:
        await asyncio.sleep(self._rng.uniform(0.5, 1.5))
        if self.chat is None:
            return
        author = self._rng.choice(MEMBERS)
        await self.chat.typing(author)
        await asyncio.sleep(self._rng.uniform(1.5, 3))
        await self.chat.ingest(
            IncomingMessage(
                tg_message_id=next(self._ids),
                author=author,
                text=self._rng.choice(REPLIES).format(nick=nick),
                ts=time.time(),
                reply_to_tg_id=message_id,
                reply_is_ours=True,
            )
        )

    def start(self) -> None:
        if self._task is None:
            self._task = asyncio.create_task(self._chatter(), name="mock-chatter")

    async def stop(self) -> None:
        for task in [self._task, *self._pending]:
            if task is not None:
                task.cancel()
                with contextlib.suppress(asyncio.CancelledError):
                    await task
        self._task = None

    async def seed(self) -> None:
        if self.chat is None or await self.chat.history():
            return
        now = time.time()
        for index, line in enumerate(LINES[:3]):
            await self.chat.ingest(
                IncomingMessage(
                    tg_message_id=next(self._ids),
                    author=MEMBERS[index],
                    text=line,
                    ts=now - (3 - index) * 180,
                )
            )

    async def _chatter(self) -> None:
        while True:
            await asyncio.sleep(self._rng.uniform(*self._every))
            if self.chat is not None:
                await self.chat.ingest(
                    IncomingMessage(
                        tg_message_id=next(self._ids),
                        author=self._rng.choice(MEMBERS),
                        text=self._rng.choice(LINES),
                        ts=time.time(),
                    )
                )
