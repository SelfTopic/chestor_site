import logging
import time
from dataclasses import dataclass, field
from typing import Any

from selfrot import BaseContext, BaseDispatcher, Bot, CommandArgs, MessageHandler, TEvent
from selfrot.exceptions import CommandArgsError
from selfrot.filter import BaseFilter, Command, HasReplyToMessage
from selfrot.types import Message, ReplyToMessageMessage, TextMessage, Update

from ..limits import LIMITS
from ..models import ChatMessage
from ..services.chat import ChatService
from ..services.moderation import ModerationService
from ..storage import MemoryStorage
from .mapping import to_incoming

logger = logging.getLogger(__name__)

ADMIN_STATUSES = frozenset({"administrator", "creator"})
ADMIN_CACHE_TTL = 300.0

TEXTS = {
    "not_admin": "Это команда для админов группы.",
    "not_relay": "Ответь командой на сообщение, которое бот переслал с сайта.",
    "banned": "🚫 {nick} больше не пишет с сайта.",
    "unbanned": "✅ {nick} снова может писать с сайта.",
    "muted": "🔇 Приём сообщений с сайта выключен на {minutes} мин.",
    "unmuted": "🔊 Приём сообщений с сайта снова включён.",
    "mute_usage": "Использование: /mute_site <минуты> (0 — включить обратно)",
}


@dataclass
class AdminCache:
    checked: dict[int, tuple[float, bool]] = field(default_factory=dict)


@dataclass
class ChatContext(BaseContext[TEvent]):
    chat_service: ChatService
    moderation: ModerationService
    group_id: int
    admins: AdminCache


class InGroup(BaseFilter[BaseContext[Any]]):
    async def check(self, ctx: BaseContext[Any]) -> bool:
        chat = ctx.chat
        return isinstance(ctx, ChatContext) and chat is not None and chat.id == ctx.group_id


class ModCommand(TextMessage, ReplyToMessageMessage, frozen=True): ...


async def is_admin(ctx: ChatContext[Any], message: Message) -> bool:
    # Анонимный админ пишет от имени самой группы.
    if message.sender_chat is not None:
        return message.sender_chat.id == ctx.group_id
    if message.user is None:
        return False
    user_id = message.user.id
    cached = ctx.admins.checked.get(user_id)
    if cached and cached[0] > time.monotonic():
        return cached[1]
    member = await ctx.bot.get_chat_member(ctx.group_id, user_id)
    verdict = member.status in ADMIN_STATUSES
    ctx.admins.checked[user_id] = (time.monotonic() + ADMIN_CACHE_TTL, verdict)
    return verdict


class Ban(MessageHandler[ChatContext[ModCommand]]):
    query = Command("ban") & HasReplyToMessage() & InGroup()

    async def handle(self) -> None:
        message = self.ctx.message
        if not await is_admin(self.ctx, message):
            await message.reply(TEXTS["not_admin"])
            return
        record = await self.ctx.moderation.ban_by_reply(message.reply_to_message.message_id)
        await message.reply(
            TEXTS["banned"].format(nick=record.nick) if record else TEXTS["not_relay"]
        )


class Unban(MessageHandler[ChatContext[ModCommand]]):
    query = Command("unban") & HasReplyToMessage() & InGroup()

    async def handle(self) -> None:
        message = self.ctx.message
        if not await is_admin(self.ctx, message):
            await message.reply(TEXTS["not_admin"])
            return
        record = await self.ctx.moderation.unban_by_reply(message.reply_to_message.message_id)
        await message.reply(
            TEXTS["unbanned"].format(nick=record.nick) if record else TEXTS["not_relay"]
        )


class MuteArgs(CommandArgs):
    minutes: int


class MuteSite(MessageHandler[ChatContext[TextMessage]]):
    cmd = Command("mute_site", MuteArgs)
    query = cmd & InGroup()

    async def handle(self) -> None:
        message = self.ctx.message
        if not await is_admin(self.ctx, message):
            await message.reply(TEXTS["not_admin"])
            return
        minutes = max(0, min(self.cmd.parse(self.ctx).minutes, 7 * 24 * 60))
        await self.ctx.moderation.mute_site(minutes)
        await message.reply(TEXTS["muted"].format(minutes=minutes) if minutes else TEXTS["unmuted"])

    async def on_error(self, exc: Exception) -> None:
        if isinstance(exc, CommandArgsError):
            await self.ctx.message.reply(TEXTS["mute_usage"])
            return
        raise exc


class GroupMessage(MessageHandler[ChatContext[Message]]):
    query = InGroup()

    async def handle(self) -> None:
        incoming = to_incoming(self.ctx.message, self.ctx.bot.id)
        if incoming is not None:
            await self.ctx.chat_service.ingest(incoming)


class _NoEvents:
    async def message(self, message: ChatMessage) -> None:
        return None

    async def typing(self, author: str) -> None:
        return None


@dataclass(frozen=True)
class BotDeps:
    chat_service: ChatService
    moderation: ModerationService
    group_id: int

    @classmethod
    def inspection(cls) -> "BotDeps":
        # selfrot tree/check создают диспетчер с одним токеном: для осмотра хватает памяти.
        storage = MemoryStorage()
        return cls(
            ChatService(storage, _NoEvents(), LIMITS), ModerationService(storage), group_id=0
        )


class ChatDispatcher(BaseDispatcher[ChatContext[Any]]):
    bot = Bot
    context = ChatContext
    handlers = (Ban, Unban, MuteSite, GroupMessage)

    def __init__(
        self, token: str | None = None, deps: BotDeps | None = None, polling: bool = True
    ) -> None:
        super().__init__(token)
        deps = deps or BotDeps.inspection()
        self.chat_service = deps.chat_service
        self.moderation = deps.moderation
        self.group_id = deps.group_id
        self.admins = AdminCache()
        self._polling = polling

    def create_context(self, update: Update) -> ChatContext[Any]:
        return self.context(
            update, self.api, self.chat_service, self.moderation, self.group_id, self.admins
        )

    async def on_startup(self) -> None:
        # Пока висит вебхук, getUpdates отвечает 409: в режиме поллинга снимаем его.
        if self._polling:
            await self.api.delete_webhook()
        logger.info("Бот @%s слушает группу %s", self.api.username, self.group_id)
