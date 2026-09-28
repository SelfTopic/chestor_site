import asyncio
import contextlib
import itertools
import math
import random
import struct
import time
import zlib
from collections.abc import Callable

from .models import IncomingMessage, MediaRef
from .services.chat import ChatService
from .services.ports import Sent

DEMO_PHOTO_ID = "mock-photo"


def _png(width: int, height: int, pixel: Callable[[int, int], tuple[int, int, int]]) -> bytes:
    rows = b"".join(
        b"\x00" + b"".join(bytes(pixel(x, y)) for x in range(width)) for y in range(height)
    )

    def chunk(kind: bytes, data: bytes) -> bytes:
        body = kind + data
        return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body))

    header = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", header)
        + chunk(b"IDAT", zlib.compress(rows))
        + chunk(b"IEND", b"")
    )


def demo_photo() -> bytes:
    # Своя картинка для демо: какуган на тёмном фоне, никаких кадров из аниме.
    width, height = 240, 160

    def pixel(x: int, y: int) -> tuple[int, int, int]:
        dx, dy = (x - width / 2) / 1.6, y - height / 2
        distance = math.hypot(dx, dy)
        if distance < 22:
            return (255, 31, 61) if distance > 7 else (18, 0, 3)
        if abs(dy) < 40 - abs(dx) * 0.55:
            return (8, 4, 6)
        return (40 + y // 8, 14, 20 + x // 12)

    return _png(width, height, pixel)


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
        self._photo: bytes | None = None

    async def fetch(self, file_id: str) -> bytes:
        if self._photo is None:
            self._photo = demo_photo()
        return self._photo

    async def send(self, nick: str, text: str) -> Sent:
        message_id = next(self._ids)
        if self.chat is not None and self._rng.random() < 0.6:
            task = asyncio.create_task(self._reply(nick, text, message_id))
            self._pending.add(task)
            task.add_done_callback(self._pending.discard)
        return Sent(message_id, time.time())

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
        await self.chat.ingest(
            IncomingMessage(
                tg_message_id=next(self._ids),
                author="Ута",
                text="новая маска, как вам?",
                ts=now - 700,
                media=MediaRef(file_id=DEMO_PHOTO_ID, kind="photo", width=240, height=160),
            )
        )
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
