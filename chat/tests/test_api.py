import asyncio
from typing import Any

from aiohttp.test_utils import TestClient

from chestor_chat.storage import MemoryStorage

from .conftest import ANSWERS, drain, pass_captcha

Client = TestClient[Any, Any]


async def test_health(client: Client) -> None:
    response = await client.get("/chat/health")
    assert await response.json() == {"ok": True}


async def test_history_describes_mode_and_limits(client: Client) -> None:
    body = await (await client.get("/chat/history")).json()
    assert body["mode"] == "mock"
    assert body["captcha"] == "fixture"
    assert body["limits"] == {"nick_min": 2, "nick_max": 24, "text_max": 300}
    assert body["pass_expires_at"] is None
    assert len(body["messages"]) == 3  # демо-группа засевает пару реплик


async def test_send_requires_captcha(client: Client) -> None:
    response = await client.post("/chat/send", json={"nick": "Гость", "text": "привет"})
    assert response.status == 401
    assert (await response.json())["error"]["code"] == "captcha_required"


async def test_wrong_answer_gives_no_pass(client: Client) -> None:
    question = await (await client.get("/chat/captcha")).json()
    wrong = next(
        option for option in question["options"] if option != ANSWERS[question["question"]]
    )
    response = await client.post(
        "/chat/captcha", json={"challenge_id": question["challenge_id"], "answer": wrong}
    )
    body = await response.json()
    assert body["correct"] is False and body["answer"] == ANSWERS[question["question"]]
    assert "chestor_pass" not in response.cookies


async def test_challenge_cannot_be_reused(client: Client) -> None:
    question = await (await client.get("/chat/captcha")).json()
    payload = {"challenge_id": question["challenge_id"], "answer": ANSWERS[question["question"]]}
    assert (await client.post("/chat/captcha", json=payload)).status == 200
    second = await client.post("/chat/captcha", json=payload)
    assert second.status == 410


async def test_full_flow_message_reaches_history_and_websocket(client: Client) -> None:
    socket = await client.ws_connect("/chat/ws")
    hello = await socket.receive_json(timeout=2)
    assert hello["type"] == "hello" and hello["mode"] == "mock"

    verdict = await pass_captcha(client)
    assert verdict["correct"] is True and verdict["pass_expires_at"]

    response = await client.post(
        "/chat/send", json={"nick": "Канеки", "text": "я гуль", "client_id": "c-1"}
    )
    assert response.status == 202
    await drain(client)

    event = await socket.receive_json(timeout=2)
    while event["type"] != "message":
        event = await socket.receive_json(timeout=2)
    assert event["message"]["author"] == "Канеки"
    assert event["message"]["source"] == "site"
    assert event["message"]["client_id"] == "c-1"

    history = await (await client.get("/chat/history")).json()
    assert history["messages"][-1]["text"] == "я гуль"
    assert history["pass_expires_at"] == verdict["pass_expires_at"]
    await socket.close()


async def test_rate_limit_per_ten_seconds(client: Client) -> None:
    await pass_captcha(client)
    first = await client.post("/chat/send", json={"nick": "Канеки", "text": "раз"})
    second = await client.post("/chat/send", json={"nick": "Канеки", "text": "два"})
    assert first.status == 202
    assert second.status == 429
    body = await second.json()
    assert body["error"]["code"] == "rate_limited" and body["error"]["retry_after"] > 0
    assert "Retry-After" in second.headers


async def test_input_is_validated_before_anything(client: Client) -> None:
    await pass_captcha(client)
    for payload, field in (
        ({"nick": "Self", "text": "я владелец"}, "nick"),
        ({"nick": "Гость", "text": "/ban"}, "text"),
        ({"nick": "Гость", "text": "https://evil.example"}, "text"),
        ({"nick": "Гость", "text": "x" * 301}, "text"),
    ):
        response = await client.post("/chat/send", json=payload)
        assert response.status == 400
        assert (await response.json())["error"]["field"] == field
    ok = await client.post("/chat/send", json={"nick": "Гость", "text": "а теперь нормально"})
    assert ok.status == 202


async def test_bad_json(client: Client) -> None:
    response = await client.post(
        "/chat/send", data=b"not json", headers={"Content-Type": "application/json"}
    )
    assert response.status == 400
    response = await client.post("/chat/send", json=["list"])
    assert response.status == 400


async def test_banned_ip_cannot_send(client: Client, storage: MemoryStorage) -> None:
    await pass_captcha(client)
    await client.post("/chat/send", json={"nick": "Канеки", "text": "до бана"})
    await drain(client)
    relay_id = int((await storage.recent_messages(1))[0].id.removeprefix("tg:"))
    record = await storage.relay(relay_id)
    assert record is not None
    await storage.ban(f"ip:{record.ip_hash}", None)
    response = await client.post("/chat/send", json={"nick": "Канеки", "text": "после бана"})
    assert response.status == 403


async def test_site_mute(client: Client, storage: MemoryStorage) -> None:
    await pass_captcha(client)
    await storage.set_site_mute(4_000_000_000)
    response = await client.post("/chat/send", json={"nick": "Канеки", "text": "тишина"})
    assert response.status == 423
    history = await (await client.get("/chat/history")).json()
    assert history["muted_until"] == 4_000_000_000


async def test_pass_cookie_is_http_only_and_scoped(client: Client) -> None:
    question = await (await client.get("/chat/captcha")).json()
    response = await client.post(
        "/chat/captcha",
        json={"challenge_id": question["challenge_id"], "answer": ANSWERS[question["question"]]},
    )
    cookie = response.cookies["chestor_pass"]
    assert cookie["httponly"] and cookie["path"] == "/chat" and cookie["samesite"] == "Lax"


async def test_online_counter(client: Client) -> None:
    first = await client.ws_connect("/chat/ws")
    await first.receive_json(timeout=2)
    second = await client.ws_connect("/chat/ws")
    hello = await second.receive_json(timeout=2)
    assert hello["online"] == 2
    await second.close()
    event = await first.receive_json(timeout=2)
    while not (event["type"] == "online" and event["count"] == 1):
        event = await first.receive_json(timeout=2)
    await first.close()
    await asyncio.sleep(0)


async def test_typing_is_relayed_to_others_only_with_pass(client: Client) -> None:
    watcher = await client.ws_connect("/chat/ws")
    await watcher.receive_json(timeout=2)

    anonymous = await client.ws_connect("/chat/ws")
    await anonymous.send_str('{"type": "typing", "nick": "Аноним"}')

    await pass_captcha(client)
    typist = await client.ws_connect("/chat/ws")
    await typist.send_str('{"type": "typing", "nick": "Канеки"}')
    await typist.send_str('{"type": "typing", "nick": "Канеки"}')  # слишком часто — не уйдёт
    await typist.send_str('{"type": "typing", "nick": "Self"}')

    typing = []
    try:
        while True:
            event = await watcher.receive_json(timeout=0.5)
            if event["type"] == "typing":
                typing.append(event["nick"])
    except TimeoutError:
        pass
    assert typing == ["Канеки"]
    for socket in (watcher, anonymous, typist):
        await socket.close()
