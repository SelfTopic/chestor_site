import asyncio
import contextlib
import logging
import time
from collections import deque
from collections.abc import Awaitable, Callable
from dataclasses import dataclass

from ..errors import QueueFull
from ..limits import Limits
from ..models import SiteSender
from .ports import GatewayError, GatewayRetryAfter, GroupGateway

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class Outgoing:
    nick: str
    text: str
    sender: SiteSender
    client_id: str | None


SentCallback = Callable[[Outgoing, int], Awaitable[None]]
FailedCallback = Callable[[Outgoing], Awaitable[None]]


# Общая очередь сайт → группа: не чаще limits.group_per_minute сообщений в минуту.
class Outbox:
    def __init__(
        self,
        gateway: GroupGateway,
        limits: Limits,
        on_sent: SentCallback,
        on_failed: FailedCallback | None = None,
        clock: Callable[[], float] = time.monotonic,
        sleep: Callable[[float], Awaitable[None]] = asyncio.sleep,
    ) -> None:
        self._gateway = gateway
        self._limits = limits
        self._on_sent = on_sent
        self._on_failed = on_failed
        self._clock = clock
        self._sleep = sleep
        self._queue: asyncio.Queue[Outgoing] = asyncio.Queue(maxsize=limits.queue_max)
        self._sent_at: deque[float] = deque()
        self._task: asyncio.Task[None] | None = None

    @property
    def size(self) -> int:
        return self._queue.qsize()

    def enqueue(self, item: Outgoing) -> int:
        try:
            self._queue.put_nowait(item)
        except asyncio.QueueFull:
            raise QueueFull("Очередь в группу переполнена") from None
        return self._queue.qsize()

    def start(self) -> None:
        if self._task is None:
            self._task = asyncio.create_task(self._run(), name="outbox")

    async def stop(self) -> None:
        if self._task is not None:
            self._task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await self._task
            self._task = None

    async def drain(self) -> None:
        await self._queue.join()

    def _wait_for_slot(self) -> float:
        now = self._clock()
        while self._sent_at and self._sent_at[0] <= now - 60:
            self._sent_at.popleft()
        if len(self._sent_at) < self._limits.group_per_minute:
            return 0.0
        return self._sent_at[0] + 60 - now

    async def _run(self) -> None:
        while True:
            item = await self._queue.get()
            try:
                await self._deliver(item)
            finally:
                self._queue.task_done()

    async def _deliver(self, item: Outgoing) -> None:
        for _ in range(3):
            wait = self._wait_for_slot()
            if wait > 0:
                await self._sleep(wait)
            try:
                message_id = await self._gateway.send(item.nick, item.text)
            except GatewayRetryAfter as exc:
                logger.warning("Telegram просит подождать %s с", exc.seconds)
                await self._sleep(exc.seconds)
                continue
            except GatewayError:
                logger.exception("Не удалось отправить сообщение с сайта")
                break
            self._sent_at.append(self._clock())
            await self._on_sent(item, message_id)
            return
        if self._on_failed is not None:
            await self._on_failed(item)
