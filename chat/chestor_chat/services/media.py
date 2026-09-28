import time
from collections import OrderedDict
from collections.abc import Callable
from typing import Protocol

from ..errors import MediaNotFound, RateLimited
from ..limits import Limits
from ..storage import Storage


class MediaFetcher(Protocol):
    async def fetch(self, file_id: str) -> bytes: ...


class MediaUnavailable(Exception):
    pass


_SIGNATURES: tuple[tuple[bytes, int, str], ...] = (
    (b"\xff\xd8\xff", 0, "image/jpeg"),
    (b"\x89PNG\r\n\x1a\n", 0, "image/png"),
    (b"WEBP", 8, "image/webp"),
)


def sniff_image(data: bytes) -> str | None:
    for signature, offset, content_type in _SIGNATURES:
        if data[offset : offset + len(signature)] == signature:
            return content_type
    return None


class MediaService:
    def __init__(
        self,
        storage: Storage,
        fetcher: MediaFetcher | None,
        limits: Limits,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self._storage = storage
        self._fetcher = fetcher
        self._limits = limits
        self._clock = clock
        self._cache: OrderedDict[str, tuple[bytes, str]] = OrderedDict()
        self._cached_bytes = 0

    async def get(self, key: str, ip_hash: str) -> tuple[bytes, str]:
        wait = await self._storage.hit(
            f"media:{ip_hash}", 3600, self._limits.media_hourly, self._clock()
        )
        if wait is not None:
            raise RateLimited("Слишком много картинок", retry_after=round(wait))
        if key in self._cache:
            self._cache.move_to_end(key)
            return self._cache[key]
        file_id = await self._storage.media_file(key)
        if file_id is None or self._fetcher is None:
            raise MediaNotFound("Картинки нет")
        try:
            data = await self._fetcher.fetch(file_id)
        except MediaUnavailable:
            raise MediaNotFound("Telegram не отдал файл") from None
        content_type = sniff_image(data)
        # Отдаём только картинки разумного размера: сайт не должен стать прокси для файлов группы.
        if content_type is None or len(data) > self._limits.media_max_bytes:
            raise MediaNotFound("Это не картинка")
        self._remember(key, (data, content_type))
        return data, content_type

    def _remember(self, key: str, entry: tuple[bytes, str]) -> None:
        self._cache[key] = entry
        self._cached_bytes += len(entry[0])
        while self._cached_bytes > self._limits.media_cache_bytes and self._cache:
            _, (old, _) = self._cache.popitem(last=False)
            self._cached_bytes -= len(old)
