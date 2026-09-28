import asyncio
from collections.abc import AsyncIterator, Callable
from typing import Any

import pytest
from aiohttp import web
from selfrot.client.telegram import TELEGRAM_API
from selfrot.types import Update

from chestor_chat.errors import Banned, SiteMuted
from chestor_chat.limits import Limits
from chestor_chat.models import ChatMessage, SiteSender
from chestor_chat.services.chat import ChatService
from chestor_chat.services.moderation import ModerationService
from chestor_chat.services.outbox import Outbox
from chestor_chat.storage import MemoryStorage
from chestor_chat.telegram.bot import BotDeps, ChatDispatcher
from chestor_chat.telegram.gateway import TelegramGateway

from .fake_telegram import BOT, GROUP_ID, TOKEN, FakeTelegram, group_message


class Events:
    def __init__(self) -> None:
        self.messages: list[ChatMessage] = []

    async def message(self, message: ChatMessage) -> None:
        self.messages.append(message)

    async def typing(self, author: str) -> None:
        return None


@pytest.fixture
async def telegram(monkeypatch: pytest.MonkeyPatch) -> AsyncIterator[FakeTelegram]:
    fake = FakeTelegram()
    app = web.Application()
    app.router.add_route("*", "/bot{token}/{method}", fake.handle)
    runner = web.AppRunner(app, access_log=None)
    await runner.setup()
    site = web.TCPSite(runner, "127.0.0.1", 0)
    await site.start()
    port = site._server.sockets[0].getsockname()[1]  # type: ignore[union-attr]
    monkeypatch.setattr(TELEGRAM_API, "url", f"http://127.0.0.1:{port}/bot{{token}}/{{method}}")
    yield fake
    await runner.cleanup()


class Harness:
    def __init__(
        self, dispatcher: ChatDispatcher, chat: ChatService, storage: MemoryStorage, events: Events
    ) -> None:
        self.dispatcher = dispatcher
        self.chat = chat
        self.storage = storage
        self.events = events

    async def feed(self, update: dict[str, Any]) -> None:
        await self.dispatcher.feed_update(
            Update.model_validate(update, context={"bot": self.dispatcher.api})
        )


@pytest.fixture
async def harness(telegram: FakeTelegram) -> AsyncIterator[Harness]:
    storage = MemoryStorage()
    events = Events()
    chat = ChatService(storage, events, Limits())
    dispatcher = ChatDispatcher(
        TOKEN, BotDeps(chat, ModerationService(storage), GROUP_ID, show_media=True)
    )
    await dispatcher.api.load_me()
    chat.outbox = Outbox(TelegramGateway(dispatcher.api, GROUP_ID), Limits(), on_sent=chat.on_sent)
    chat.outbox.start()
    yield Harness(dispatcher, chat, storage, events)
    await chat.outbox.stop()
    await dispatcher.api.close_session()


async def eventually(condition: Callable[[], bool], within: float = 2.0) -> None:
    # Диспетчер обрабатывает апдейты фоном: ждём результата опросом, с потолком по времени.
    async with asyncio.timeout(within):
        while not condition():  # noqa: ASYNC110
            await asyncio.sleep(0.01)


async def test_group_text_reaches_site_without_username(harness: Harness) -> None:
    await harness.feed(group_message(1, "всем привет"))
    await eventually(lambda: len(harness.events.messages) == 1)
    message = harness.events.messages[0]
    assert (message.author, message.text, message.source) == ("Тока", "всем привет", "telegram")
    assert "secret_username" not in str(message.to_json())


async def test_photos_and_stickers_become_site_media(harness: Harness) -> None:
    photo = [
        {"file_id": "small", "file_unique_id": "u1", "width": 90, "height": 60},
        {"file_id": "mid", "file_unique_id": "u2", "width": 800, "height": 600},
        {"file_id": "huge", "file_unique_id": "u3", "width": 2560, "height": 1920},
    ]
    await harness.feed(group_message(1, None, photo=photo, caption="смотрите"))
    sticker = {
        "file_id": "s",
        "file_unique_id": "su",
        "type": "regular",
        "width": 512,
        "height": 512,
        "is_animated": False,
        "is_video": False,
    }
    await harness.feed(group_message(2, None, sticker=sticker))
    await eventually(lambda: len(harness.events.messages) == 2)
    by_kind = {m.media.kind: m for m in harness.events.messages if m.media}
    assert by_kind["photo"].text == "смотрите"
    assert (by_kind["photo"].media.width, by_kind["photo"].media.height) == (800, 600)  # type: ignore[union-attr]
    assert by_kind["sticker"].text == ""
    for message in harness.events.messages:
        assert message.media is not None
        assert "mid" not in message.media.key and message.media.key != "s"
    assert await harness.storage.media_file(by_kind["photo"].media.key) == "mid"  # type: ignore[union-attr]


async def test_other_media_stay_placeholders(harness: Harness) -> None:
    video = {"file_id": "v", "file_unique_id": "vu", "width": 1, "height": 1, "duration": 3}
    await harness.feed(group_message(1, None, video=video, caption="клип"))
    animated = {
        "file_id": "a",
        "file_unique_id": "au",
        "type": "regular",
        "width": 512,
        "height": 512,
        "is_animated": True,
        "is_video": False,
    }
    await harness.feed(group_message(2, None, sticker=animated))
    await eventually(lambda: len(harness.events.messages) == 2)
    texts = sorted(message.text for message in harness.events.messages)
    assert texts == ["[видео] клип", "[стикер]"]
    assert all(message.media is None for message in harness.events.messages)


async def test_other_chats_and_service_messages_are_ignored(harness: Harness) -> None:
    await harness.feed(group_message(1, "из другого чата", chat_id=-999))
    await harness.feed(
        group_message(
            2, None, new_chat_members=[{"id": 9, "is_bot": False, "first_name": "Новичок"}]
        )
    )
    await harness.feed(group_message(3, "а это наше"))
    await eventually(lambda: len(harness.events.messages) == 1)
    await asyncio.sleep(0.05)
    assert [message.text for message in harness.events.messages] == ["а это наше"]


async def test_site_message_goes_with_bold_nick_entity_and_no_parse_mode(
    harness: Harness, telegram: FakeTelegram
) -> None:
    await harness.chat.submit(SiteSender("ip", "pass"), "Ник\U00010437", "*привет* <b>мир</b>")
    await eventually(lambda: len(telegram.sent()) == 1)
    body = telegram.sent()[0]
    assert body["chat_id"] == GROUP_ID
    assert body["text"] == "Ник\U00010437 — *привет* <b>мир</b>"
    assert body["entities"] == [{"type": "bold", "offset": 0, "length": 5}]
    assert "parse_mode" not in body
    await eventually(lambda: any(message.source == "site" for message in harness.events.messages))
    assert harness.events.messages[-1].author == "Ник\U00010437"


async def test_site_message_time_comes_from_telegram_not_server_clock(
    harness: Harness, telegram: FakeTelegram
) -> None:
    await harness.chat.submit(SiteSender("ip", "pass"), "Канеки", "который час?")
    await eventually(lambda: any(message.source == "site" for message in harness.events.messages))
    assert harness.events.messages[-1].ts == 1_790_000_000.0


async def test_reply_to_site_message_is_quoted_with_nick(
    harness: Harness, telegram: FakeTelegram
) -> None:
    await harness.chat.submit(SiteSender("ip", "pass"), "Канеки", "я с сайта")
    await eventually(lambda: len(harness.events.messages) == 1)
    relay_id = int(harness.events.messages[0].id.removeprefix("tg:"))
    ours = {
        "message_id": relay_id,
        "date": 1,
        "chat": {"id": GROUP_ID, "type": "supergroup"},
        "from": BOT,
        "text": "Канеки — я с сайта",
    }
    await harness.feed(group_message(10, "ответ", reply_to=ours))
    await eventually(lambda: len(harness.events.messages) == 2)
    quote = harness.events.messages[-1].quote
    assert quote is not None and (quote.author, quote.text) == ("Канеки", "я с сайта")


async def relay(harness: Harness, telegram: FakeTelegram, sender: SiteSender) -> dict[str, Any]:
    await harness.chat.submit(sender, "Канеки", "спам")
    await eventually(lambda: any(message.source == "site" for message in harness.events.messages))
    relay_id = int(harness.events.messages[-1].id.removeprefix("tg:"))
    return {
        "message_id": relay_id,
        "date": 1,
        "chat": {"id": GROUP_ID, "type": "supergroup"},
        "from": BOT,
        "text": "Канеки — спам",
    }


async def test_admin_ban_by_reply_blocks_site_sender(
    harness: Harness, telegram: FakeTelegram
) -> None:
    telegram.admins.add(1)
    sender = SiteSender("ip-hash", "pass-id")
    ours = await relay(harness, telegram, sender)
    await harness.feed(group_message(20, "/ban", user_id=1, first_name="Админ", reply_to=ours))
    await eventually(lambda: any("больше не пишет" in body["text"] for body in telegram.sent()))
    assert await harness.storage.banned(["ip:ip-hash"], now=0)
    assert await harness.storage.banned(["pass:pass-id"], now=0)
    with pytest.raises(Banned):
        await harness.chat.submit(SiteSender("ip-hash", "новый-пропуск"), "Другой", "обход")

    await harness.feed(group_message(21, "/unban", user_id=1, first_name="Админ", reply_to=ours))
    await eventually(lambda: any("снова может" in body["text"] for body in telegram.sent()))
    assert not await harness.storage.banned(["ip:ip-hash", "pass:pass-id"], now=0)


async def test_ban_from_non_admin_is_refused(harness: Harness, telegram: FakeTelegram) -> None:
    ours = await relay(harness, telegram, SiteSender("ip-hash", "pass-id"))
    await harness.feed(group_message(30, "/ban", user_id=2, reply_to=ours))
    await eventually(lambda: any("для админов" in body["text"] for body in telegram.sent()))
    assert not await harness.storage.banned(["ip:ip-hash"], now=0)


async def test_ban_reply_to_non_relay(harness: Harness, telegram: FakeTelegram) -> None:
    telegram.admins.add(1)
    human = {
        "message_id": 99,
        "date": 1,
        "chat": {"id": GROUP_ID, "type": "supergroup"},
        "from": {"id": 5, "is_bot": False, "first_name": "Хинами"},
        "text": "я человек",
    }
    await harness.feed(group_message(31, "/ban", user_id=1, reply_to=human))
    await eventually(lambda: any("переслал с сайта" in body["text"] for body in telegram.sent()))


async def test_mute_site(harness: Harness, telegram: FakeTelegram) -> None:
    telegram.admins.add(1)
    await harness.feed(group_message(40, "/mute_site 5", user_id=1))
    await eventually(lambda: any("выключен на 5" in body["text"] for body in telegram.sent()))
    with pytest.raises(SiteMuted):
        await harness.chat.submit(SiteSender("ip", "pass"), "Канеки", "тишина")
    await harness.feed(group_message(41, "/mute_site 0", user_id=1))
    await eventually(lambda: any("снова включён" in body["text"] for body in telegram.sent()))
    assert await harness.chat.muted_until() is None
    await harness.feed(group_message(42, "/mute_site долго", user_id=1))
    await eventually(lambda: any("Использование" in body["text"] for body in telegram.sent()))


async def test_moderation_commands_do_not_leak_to_site(
    harness: Harness, telegram: FakeTelegram
) -> None:
    telegram.admins.add(1)
    await harness.feed(group_message(50, "/mute_site 1", user_id=1))
    await eventually(lambda: len(telegram.sent()) == 1)
    assert harness.events.messages == []


async def test_media_can_be_switched_off(telegram: FakeTelegram) -> None:
    storage = MemoryStorage()
    events = Events()
    chat = ChatService(storage, events, Limits())
    dispatcher = ChatDispatcher(
        TOKEN, BotDeps(chat, ModerationService(storage), GROUP_ID, show_media=False)
    )
    await dispatcher.api.load_me()
    photo = [{"file_id": "f", "file_unique_id": "u", "width": 10, "height": 10}]
    update = group_message(1, None, photo=photo, caption="без картинки")
    await dispatcher.feed_update(Update.model_validate(update, context={"bot": dispatcher.api}))
    await eventually(lambda: len(events.messages) == 1)
    assert events.messages[0].media is None and events.messages[0].text == "[фото] без картинки"
    await dispatcher.api.close_session()
