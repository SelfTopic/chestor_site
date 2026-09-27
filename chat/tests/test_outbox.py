import asyncio

import pytest

from chestor_chat.errors import QueueFull
from chestor_chat.limits import Limits
from chestor_chat.models import SiteSender
from chestor_chat.services.outbox import Outbox, Outgoing
from chestor_chat.services.ports import GatewayRetryAfter


class FakeClock:
    def __init__(self) -> None:
        self.now = 0.0
        self.sleeps: list[float] = []

    def __call__(self) -> float:
        return self.now

    async def sleep(self, seconds: float) -> None:
        self.sleeps.append(seconds)
        self.now += seconds
        await asyncio.sleep(0)


class RecordingGateway:
    def __init__(self, clock: FakeClock, fail_once_with: float | None = None) -> None:
        self.clock = clock
        self.sent: list[tuple[float, str]] = []
        self._fail = fail_once_with

    async def send(self, nick: str, text: str) -> int:
        if self._fail is not None:
            seconds, self._fail = self._fail, None
            raise GatewayRetryAfter(seconds)
        self.sent.append((self.clock.now, text))
        return len(self.sent)


def item(index: int) -> Outgoing:
    return Outgoing(nick="Ник", text=str(index), sender=SiteSender("h", "p"), client_id=None)


async def test_group_rate_never_exceeds_limit_per_minute() -> None:
    clock = FakeClock()
    gateway = RecordingGateway(clock)
    delivered: list[int] = []

    async def on_sent(_item: Outgoing, message_id: int) -> None:
        delivered.append(message_id)

    outbox = Outbox(
        gateway, Limits(group_per_minute=15, queue_max=50), on_sent, clock=clock, sleep=clock.sleep
    )
    for index in range(40):
        outbox.enqueue(item(index))
    outbox.start()
    await asyncio.wait_for(outbox.drain(), timeout=5)
    await outbox.stop()

    times = [at for at, _ in gateway.sent]
    assert len(times) == 40 and delivered == list(range(1, 41))
    for start in times:
        assert sum(1 for at in times if start <= at < start + 60) <= 15
    assert [text for _, text in gateway.sent] == [str(index) for index in range(40)]


async def test_retry_after_is_respected() -> None:
    clock = FakeClock()
    gateway = RecordingGateway(clock, fail_once_with=7)

    async def on_sent(_item: Outgoing, _message_id: int) -> None:
        return None

    outbox = Outbox(gateway, Limits(), on_sent, clock=clock, sleep=clock.sleep)
    outbox.enqueue(item(1))
    outbox.start()
    await asyncio.wait_for(outbox.drain(), timeout=5)
    await outbox.stop()
    assert 7 in clock.sleeps
    assert gateway.sent == [(7.0, "1")]


async def test_queue_overflow() -> None:
    clock = FakeClock()

    async def on_sent(_item: Outgoing, _message_id: int) -> None:
        return None

    outbox = Outbox(
        RecordingGateway(clock), Limits(queue_max=2), on_sent, clock=clock, sleep=clock.sleep
    )
    assert outbox.enqueue(item(1)) == 1
    assert outbox.enqueue(item(2)) == 2
    with pytest.raises(QueueFull):
        outbox.enqueue(item(3))
