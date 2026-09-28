from dataclasses import dataclass
from typing import Protocol

from ..models import ChatMessage


class ChatEvents(Protocol):
    async def message(self, message: ChatMessage) -> None: ...

    # «Печатает…»: не хранится, только рассылается открытым вкладкам.
    async def typing(self, author: str) -> None: ...


class GatewayRetryAfter(Exception):
    def __init__(self, seconds: float) -> None:
        super().__init__(f"retry after {seconds}s")
        self.seconds = seconds


class GatewayError(Exception):
    pass


@dataclass(frozen=True)
class Sent:
    message_id: int
    # Время сообщения по часам Telegram: те же часы, что у сообщений из группы.
    ts: float


class GroupGateway(Protocol):
    # Отправить «Ник — текст» в группу и вернуть, что Telegram сказал об отправленном.
    async def send(self, nick: str, text: str) -> Sent: ...
