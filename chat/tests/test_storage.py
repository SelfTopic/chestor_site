import time
from collections.abc import AsyncIterator

import pytest
from fakeredis import FakeAsyncRedis

from chestor_chat.models import ChatMessage, Quote, RelayRecord
from chestor_chat.storage import MemoryStorage, Storage
from chestor_chat.storage.redis_store import RedisStorage


@pytest.fixture(params=["memory", "redis"])
async def storage(request: pytest.FixtureRequest) -> AsyncIterator[Storage]:
    if request.param == "memory":
        yield MemoryStorage()
        return
    store = RedisStorage(FakeAsyncRedis(decode_responses=True))
    yield store
    await store.close()


def message(index: int) -> ChatMessage:
    return ChatMessage(
        id=f"tg:{index}", source="telegram", author="Тока", text=f"m{index}", ts=float(index)
    )


async def test_history_is_trimmed(storage: Storage) -> None:
    for index in range(5):
        await storage.add_message(message(index), keep=3)
    recent = await storage.recent_messages(10)
    assert [item.id for item in recent] == ["tg:2", "tg:3", "tg:4"]
    assert [item.id for item in await storage.recent_messages(2)] == ["tg:3", "tg:4"]


async def test_message_roundtrip_with_quote(storage: Storage) -> None:
    original = ChatMessage(
        id="tg:1",
        source="site",
        author="Ник",
        text="т",
        ts=1.5,
        quote=Quote("Тока", "эй"),
        client_id="c",
    )
    await storage.add_message(original, keep=10)
    assert await storage.recent_messages(1) == [original]


async def test_hit_sliding_window(storage: Storage) -> None:
    assert await storage.hit("k", window=10, limit=2, now=100) is None
    assert await storage.hit("k", window=10, limit=2, now=101) is None
    wait = await storage.hit("k", window=10, limit=2, now=105)
    assert wait == pytest.approx(5)
    assert await storage.hit("k", window=10, limit=2, now=110.5) is None


async def test_bans(storage: Storage) -> None:
    now = time.time()
    await storage.ban("ip:a", None)
    await storage.ban("pass:b", until=now + 100)
    assert await storage.banned(["ip:a"], now=now)
    assert await storage.banned(["pass:b"], now=now)
    assert not await storage.banned(["pass:b"], now=now + 200)
    await storage.unban("ip:a")
    assert not await storage.banned(["ip:a", "ip:x"], now=now)


async def test_site_mute(storage: Storage) -> None:
    assert await storage.site_mute_until(now=100) is None
    await storage.set_site_mute(4_000_000_000)
    assert await storage.site_mute_until(now=100) == 4_000_000_000
    await storage.set_site_mute(None)
    assert await storage.site_mute_until(now=100) is None


async def test_challenge_is_single_use(storage: Storage) -> None:
    await storage.put_challenge("c1", {"question_id": 7, "options": ["a"]}, ttl=60)
    assert await storage.take_challenge("c1") == {"question_id": 7, "options": ["a"]}
    assert await storage.take_challenge("c1") is None


async def test_relay_records(storage: Storage) -> None:
    record = RelayRecord(nick="Ник", text="привет", ip_hash="h", pass_id="p")
    await storage.remember_relay(42, record, ttl=60)
    assert await storage.relay(42) == record
    assert await storage.relay(43) is None
