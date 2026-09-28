from selfrot import Bot
from selfrot.exceptions import SelfrotError, TelegramRetryAfter
from selfrot.types import LinkPreviewOptions, MessageEntity

from ..services.media import MediaUnavailable
from ..services.ports import GatewayError, GatewayRetryAfter, Sent
from ..validation import utf16_length


def relay_body(nick: str, text: str) -> tuple[str, list[MessageEntity]]:
    # Только entities и никакого parse_mode: текст с сайта не может ничего отформатировать.
    body = f"{nick} — {text}"
    return body, [MessageEntity(type="bold", offset=0, length=utf16_length(nick))]


class TelegramGateway:
    def __init__(self, bot: Bot, chat_id: int) -> None:
        self._bot = bot
        self._chat_id = chat_id

    async def send(self, nick: str, text: str) -> Sent:
        body, entities = relay_body(nick, text)
        try:
            message = await self._bot.send_message(
                self._chat_id,
                body,
                entities=entities,
                link_preview_options=LinkPreviewOptions(is_disabled=True),
            )
        except TelegramRetryAfter as exc:
            raise GatewayRetryAfter(float(exc.retry_after)) from exc
        except SelfrotError as exc:
            raise GatewayError(str(exc)) from exc
        return Sent(message.message_id, float(message.date))

    async def fetch(self, file_id: str) -> bytes:
        try:
            return await self._bot.download(file_id)
        except SelfrotError as exc:
            raise MediaUnavailable(str(exc)) from exc
