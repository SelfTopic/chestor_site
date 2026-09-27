from typing import Any

import pytest
from aiohttp.test_utils import TestClient, TestServer

from chestor_chat.api.routes import DEPS
from chestor_chat.app import create_app
from chestor_chat.config import Settings
from chestor_chat.errors import MediaNotFound, RateLimited
from chestor_chat.limits import Limits
from chestor_chat.models import IncomingMessage, MediaRef
from chestor_chat.services.media import MediaService, MediaUnavailable, sniff_image
from chestor_chat.storage import MemoryStorage

JPEG = b"\xff\xd8\xff\xe0" + b"0" * 100
WEBP = b"RIFF\x00\x00\x00\x00WEBPVP8 " + b"0" * 50


class FakeFetcher:
    def __init__(self, files: dict[str, bytes]) -> None:
        self.files = files
        self.calls: list[str] = []

    async def fetch(self, file_id: str) -> bytes:
        self.calls.append(file_id)
        if file_id not in self.files:
            raise MediaUnavailable(file_id)
        return self.files[file_id]


def test_sniff_image() -> None:
    assert sniff_image(JPEG) == "image/jpeg"
    assert sniff_image(WEBP) == "image/webp"
    assert sniff_image(b"<html>") is None


async def test_media_by_key_with_cache() -> None:
    storage = MemoryStorage()
    await storage.put_media("key-1234567890abcdef", "file-1", ttl=60)
    fetcher = FakeFetcher({"file-1": JPEG})
    service = MediaService(storage, fetcher, Limits())
    assert await service.get("key-1234567890abcdef", "ip") == (JPEG, "image/jpeg")
    assert await service.get("key-1234567890abcdef", "ip") == (JPEG, "image/jpeg")
    assert fetcher.calls == ["file-1"]


async def test_unknown_key_and_non_images_are_refused() -> None:
    storage = MemoryStorage()
    await storage.put_media("html-key", "file-html", ttl=60)
    await storage.put_media("big-key", "file-big", ttl=60)
    service = MediaService(
        storage, FakeFetcher({"file-html": b"<html>", "file-big": JPEG}), Limits(media_max_bytes=10)
    )
    for key in ("nope", "html-key", "big-key"):
        with pytest.raises(MediaNotFound):
            await service.get(key, "ip")


async def test_media_rate_limit() -> None:
    storage = MemoryStorage()
    service = MediaService(storage, None, Limits(media_hourly=2))
    for _ in range(2):
        with pytest.raises(MediaNotFound):
            await service.get("k", "ip")
    with pytest.raises(RateLimited):
        await service.get("k", "ip")


async def test_media_endpoint_serves_ingested_photo(settings: Settings) -> None:
    storage = MemoryStorage()
    app = create_app(
        settings, storage=storage, media_fetcher=FakeFetcher({"file-1": JPEG}), start_bot=False
    )
    async with TestClient(TestServer(app)) as client:
        chat = app[DEPS].chat
        message = await chat.ingest(
            IncomingMessage(
                tg_message_id=1,
                author="Тока",
                text="",
                ts=1.0,
                media=MediaRef(file_id="file-1", kind="photo", width=800, height=600),
            )
        )
        assert message.media is not None
        response = await client.get(f"/chat/media/{message.media.key}")
        assert response.status == 200
        assert response.headers["Content-Type"] == "image/jpeg"
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        assert await response.read() == JPEG
        assert (await client.get("/chat/media/0000000000000000000000")).status == 404
        history: Any = await (await client.get("/chat/history")).json()
        assert history["messages"][-1]["media"]["kind"] == "photo"
        assert "file-1" not in str(history)
