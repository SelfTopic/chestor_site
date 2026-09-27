import json
import secrets
from typing import Any

from redis.asyncio import Redis

from ..models import ChatMessage, RelayRecord

PREFIX = "chestor_chat:"


class RedisStorage:
    def __init__(self, redis: Redis) -> None:
        self._redis = redis

    @classmethod
    def from_url(cls, url: str) -> "RedisStorage":
        return cls(Redis.from_url(url, decode_responses=True))

    async def add_message(self, message: ChatMessage, keep: int) -> None:
        key = PREFIX + "history"
        async with self._redis.pipeline(transaction=True) as pipe:
            pipe.rpush(key, json.dumps(message.to_json(), ensure_ascii=False))
            pipe.ltrim(key, -keep, -1)
            await pipe.execute()

    async def recent_messages(self, limit: int) -> list[ChatMessage]:
        raw = await self._redis.lrange(PREFIX + "history", -limit, -1)  # type: ignore[misc]
        return [ChatMessage.from_json(json.loads(item)) for item in raw]

    async def hit(self, key: str, window: float, limit: int, now: float) -> float | None:
        # Скользящее окно на sorted set: считаем события за window секунд.
        zkey = PREFIX + "hits:" + key
        async with self._redis.pipeline(transaction=True) as pipe:
            pipe.zremrangebyscore(zkey, 0, now - window)
            pipe.zrange(zkey, 0, 0, withscores=True)
            pipe.zcard(zkey)
            _, oldest, count = await pipe.execute()
        if count >= limit:
            first = float(oldest[0][1]) if oldest else now
            return max(first + window - now, 0.0)
        async with self._redis.pipeline(transaction=True) as pipe:
            pipe.zadd(zkey, {f"{now}:{secrets.token_hex(4)}": now})
            pipe.expire(zkey, int(window) + 1)
            await pipe.execute()
        return None

    async def ban(self, subject: str, until: float | None) -> None:
        key = PREFIX + "ban:" + subject
        if until is None:
            await self._redis.set(key, "forever")
        else:
            await self._redis.set(key, str(until), exat=int(until) + 1)

    async def unban(self, subject: str) -> None:
        await self._redis.delete(PREFIX + "ban:" + subject)

    async def banned(self, subjects: list[str], now: float) -> bool:
        if not subjects:
            return False
        values = await self._redis.mget([PREFIX + "ban:" + subject for subject in subjects])
        return any(
            value == "forever" or (value is not None and float(value) > now) for value in values
        )

    async def set_site_mute(self, until: float | None) -> None:
        key = PREFIX + "mute"
        if until is None:
            await self._redis.delete(key)
        else:
            await self._redis.set(key, str(until), exat=int(until) + 1)

    async def site_mute_until(self, now: float) -> float | None:
        value = await self._redis.get(PREFIX + "mute")
        if value is not None and float(value) > now:
            return float(value)
        return None

    async def put_challenge(self, challenge_id: str, data: dict[str, Any], ttl: int) -> None:
        await self._redis.set(PREFIX + "challenge:" + challenge_id, json.dumps(data), ex=ttl)

    async def take_challenge(self, challenge_id: str) -> dict[str, Any] | None:
        # GETDEL: вопрос капчи одноразовый, второй ответ на тот же вызов не пройдёт.
        raw = await self._redis.getdel(PREFIX + "challenge:" + challenge_id)
        return json.loads(raw) if raw else None

    async def remember_relay(self, tg_message_id: int, record: RelayRecord, ttl: int) -> None:
        await self._redis.set(
            PREFIX + f"relay:{tg_message_id}", json.dumps(record.to_json()), ex=ttl
        )

    async def relay(self, tg_message_id: int) -> RelayRecord | None:
        raw = await self._redis.get(PREFIX + f"relay:{tg_message_id}")
        return RelayRecord.from_json(json.loads(raw)) if raw else None

    async def close(self) -> None:
        await self._redis.aclose()
