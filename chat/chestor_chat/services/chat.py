import time
from collections.abc import Callable

from ..errors import Banned, CaptchaRequired, SiteMuted
from ..limits import Limits
from ..models import ChatMessage, IncomingMessage, Quote, RelayRecord, SiteSender
from ..storage import Storage
from ..validation import clean_nick, clean_text
from .outbox import Outbox, Outgoing
from .ports import ChatEvents
from .ratelimit import SendRateLimiter

# Пересланное сообщение с сайта живёт в памяти бота неделю: столько можно банить ответом.
RELAY_TTL = 7 * 24 * 3600
QUOTE_MAX = 120


def ban_subjects(sender: SiteSender) -> list[str]:
    subjects = [f"ip:{sender.ip_hash}"]
    if sender.pass_id:
        subjects.append(f"pass:{sender.pass_id}")
    return subjects


class ChatService:
    def __init__(
        self,
        storage: Storage,
        events: ChatEvents,
        limits: Limits,
        reserved_nicks: tuple[str, ...] = (),
        clock: Callable[[], float] = time.time,
    ) -> None:
        self._storage = storage
        self._events = events
        self._limits = limits
        self._reserved = reserved_nicks
        self._clock = clock
        self._rate = SendRateLimiter(storage, limits)
        self.outbox: Outbox | None = None

    async def history(self) -> list[ChatMessage]:
        return await self._storage.recent_messages(self._limits.history_page)

    async def muted_until(self) -> float | None:
        return await self._storage.site_mute_until(self._clock())

    async def ingest(self, incoming: IncomingMessage) -> ChatMessage:
        message = ChatMessage(
            id=f"tg:{incoming.tg_message_id}",
            source="telegram",
            author=incoming.author,
            text=incoming.text,
            ts=incoming.ts,
            quote=await self._quote_for(incoming),
        )
        await self._publish(message)
        return message

    async def _quote_for(self, incoming: IncomingMessage) -> Quote | None:
        if incoming.reply_to_tg_id is None:
            return None
        if incoming.reply_is_ours:
            relay = await self._storage.relay(incoming.reply_to_tg_id)
            if relay is not None:
                return Quote(author=relay.nick, text=relay.text[:QUOTE_MAX])
        if incoming.reply_author is None:
            return None
        return Quote(author=incoming.reply_author, text=(incoming.reply_text or "")[:QUOTE_MAX])

    async def submit(
        self, sender: SiteSender, nick: str, text: str, client_id: str | None = None
    ) -> int:
        clean = clean_nick(nick, limits=self._limits, extra_reserved=self._reserved)
        body = clean_text(text, limits=self._limits)
        now = self._clock()
        if await self._storage.site_mute_until(now) is not None:
            raise SiteMuted("Приём с сайта временно выключен")
        if await self._storage.banned(ban_subjects(sender), now):
            raise Banned("CCG внесла тебя в список")
        if sender.pass_id is None:
            raise CaptchaRequired("Сначала докажи, что ты гуль")
        await self._rate.consume(sender, now)
        if self.outbox is None:
            raise RuntimeError("Outbox не подключён")
        return self.outbox.enqueue(
            Outgoing(nick=clean, text=body, sender=sender, client_id=client_id)
        )

    async def on_sent(self, item: Outgoing, tg_message_id: int) -> None:
        record = RelayRecord(
            nick=item.nick, text=item.text, ip_hash=item.sender.ip_hash, pass_id=item.sender.pass_id
        )
        await self._storage.remember_relay(tg_message_id, record, RELAY_TTL)
        await self._publish(
            ChatMessage(
                id=f"tg:{tg_message_id}",
                source="site",
                author=item.nick,
                text=item.text,
                ts=self._clock(),
                client_id=item.client_id,
            )
        )

    async def _publish(self, message: ChatMessage) -> None:
        await self._storage.add_message(message, self._limits.history_size)
        await self._events.message(message)
