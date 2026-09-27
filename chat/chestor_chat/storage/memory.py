import time
from collections import deque
from typing import Any

from ..models import ChatMessage, RelayRecord


class MemoryStorage:
    def __init__(self) -> None:
        self._messages: deque[ChatMessage] = deque()
        self._hits: dict[str, deque[float]] = {}
        self._bans: dict[str, float | None] = {}
        self._mute_until: float | None = None
        self._challenges: dict[str, tuple[float, dict[str, Any]]] = {}
        self._relays: dict[int, tuple[float, RelayRecord]] = {}

    async def add_message(self, message: ChatMessage, keep: int) -> None:
        self._messages.append(message)
        while len(self._messages) > keep:
            self._messages.popleft()

    async def recent_messages(self, limit: int) -> list[ChatMessage]:
        return list(self._messages)[-limit:]

    async def hit(self, key: str, window: float, limit: int, now: float) -> float | None:
        events = self._hits.setdefault(key, deque())
        while events and events[0] <= now - window:
            events.popleft()
        if len(events) >= limit:
            return max(events[0] + window - now, 0.0)
        events.append(now)
        return None

    async def ban(self, subject: str, until: float | None) -> None:
        self._bans[subject] = until

    async def unban(self, subject: str) -> None:
        self._bans.pop(subject, None)

    async def banned(self, subjects: list[str], now: float) -> bool:
        for subject in subjects:
            if subject in self._bans:
                until = self._bans[subject]
                if until is None or until > now:
                    return True
        return False

    async def set_site_mute(self, until: float | None) -> None:
        self._mute_until = until

    async def site_mute_until(self, now: float) -> float | None:
        if self._mute_until is not None and self._mute_until > now:
            return self._mute_until
        return None

    async def put_challenge(self, challenge_id: str, data: dict[str, Any], ttl: int) -> None:
        self._sweep()
        self._challenges[challenge_id] = (time.time() + ttl, data)

    async def take_challenge(self, challenge_id: str) -> dict[str, Any] | None:
        entry = self._challenges.pop(challenge_id, None)
        if entry is None or entry[0] <= time.time():
            return None
        return entry[1]

    async def remember_relay(self, tg_message_id: int, record: RelayRecord, ttl: int) -> None:
        self._sweep()
        self._relays[tg_message_id] = (time.time() + ttl, record)

    async def relay(self, tg_message_id: int) -> RelayRecord | None:
        entry = self._relays.get(tg_message_id)
        if entry is None or entry[0] <= time.time():
            return None
        return entry[1]

    async def close(self) -> None:
        return None

    def _sweep(self) -> None:
        now = time.time()
        for key in [key for key, (expires, _) in self._challenges.items() if expires <= now]:
            del self._challenges[key]
        for tg_id in [tg_id for tg_id, (expires, _) in self._relays.items() if expires <= now]:
            del self._relays[tg_id]
