import time
from collections.abc import Callable

from ..models import RelayRecord, SiteSender
from ..storage import Storage
from .chat import ban_subjects


class ModerationService:
    def __init__(self, storage: Storage, clock: Callable[[], float] = time.time) -> None:
        self._storage = storage
        self._clock = clock

    async def ban_by_reply(self, tg_message_id: int) -> RelayRecord | None:
        record = await self._storage.relay(tg_message_id)
        if record is None:
            return None
        for subject in ban_subjects(SiteSender(ip_hash=record.ip_hash, pass_id=record.pass_id)):
            await self._storage.ban(subject, None)
        return record

    async def unban_by_reply(self, tg_message_id: int) -> RelayRecord | None:
        record = await self._storage.relay(tg_message_id)
        if record is None:
            return None
        for subject in ban_subjects(SiteSender(ip_hash=record.ip_hash, pass_id=record.pass_id)):
            await self._storage.unban(subject)
        return record

    async def mute_site(self, minutes: int) -> float | None:
        until = self._clock() + minutes * 60 if minutes > 0 else None
        await self._storage.set_site_mute(until)
        return until
