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


class GroupGateway(Protocol):
    # Отправить «Ник — текст» в группу и вернуть message_id отправленного сообщения.
    async def send(self, nick: str, text: str) -> int: ...
