from ..errors import RateLimited
from ..limits import Limits
from ..models import SiteSender
from ..storage import Storage


class SendRateLimiter:
    def __init__(self, storage: Storage, limits: Limits) -> None:
        self._storage = storage
        self._limits = limits

    async def consume(self, sender: SiteSender, now: float) -> None:
        subjects = [f"ip:{sender.ip_hash}"]
        if sender.pass_id:
            subjects.append(f"pass:{sender.pass_id}")
        windows = (
            (self._limits.send_burst_window, self._limits.send_burst),
            (self._limits.send_hourly_window, self._limits.send_hourly),
        )
        for subject in subjects:
            for window, limit in windows:
                wait = await self._storage.hit(f"send:{window}:{subject}", window, limit, now)
                if wait is not None:
                    raise RateLimited("Слишком часто", retry_after=round(wait, 1))
