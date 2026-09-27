import json
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any

import pytest
from aiohttp.test_utils import TestClient, TestServer

from chestor_chat.app import OUTBOX, create_app
from chestor_chat.config import Settings
from chestor_chat.storage import MemoryStorage

FIXTURE = Path(__file__).parent / "fixtures" / "quiz_questions.json"
ANSWERS = {
    item["question"]: item["answer"] for item in json.loads(FIXTURE.read_text(encoding="utf-8"))
}


@pytest.fixture
def settings() -> Settings:
    return Settings(
        chat_mode="mock", ip_hash_salt="salt", pass_secret="secret", quiz_fixture_path=FIXTURE
    )


@pytest.fixture
def storage() -> MemoryStorage:
    return MemoryStorage()


@pytest.fixture
async def client(settings: Settings, storage: MemoryStorage) -> AsyncIterator[TestClient[Any, Any]]:
    app = create_app(settings, storage=storage, start_bot=False)
    async with TestClient(TestServer(app)) as test_client:
        yield test_client


async def pass_captcha(client: TestClient[Any, Any]) -> dict[str, Any]:
    question = await (await client.get("/chat/captcha")).json()
    response = await client.post(
        "/chat/captcha",
        json={"challenge_id": question["challenge_id"], "answer": ANSWERS[question["question"]]},
    )
    assert response.status == 200
    return await response.json()


async def drain(client: TestClient[Any, Any]) -> None:
    await client.app[OUTBOX].drain()
