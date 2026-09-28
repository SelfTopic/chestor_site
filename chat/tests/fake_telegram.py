import inspect
import itertools
import json
from collections.abc import Callable
from typing import Any

from aiohttp import web

TOKEN = "123456:TEST-token"
BOT = {"id": 123456, "is_bot": True, "first_name": "SiteBot", "username": "site_test_bot"}
GROUP_ID = -100500


# Настоящий HTTP-сервер на localhost, записывающий вызовы Bot API (как FakeTelegram в chestor_bot).
class FakeTelegram:
    def __init__(self) -> None:
        self.calls: list[tuple[str, dict[str, Any]]] = []
        self.handlers: dict[str, Callable[[dict[str, Any]], Any]] = {}
        self.admins: set[int] = set()
        self._ids = itertools.count(5000)

    def sent(self) -> list[dict[str, Any]]:
        return [body for method, body in self.calls if method == "sendMessage"]

    def _default(self, method: str, body: dict[str, Any]) -> Any:
        if method == "getMe":
            return BOT
        if method == "getChatMember":
            if body["user_id"] in self.admins:
                return {
                    "status": "creator",
                    "user": {"id": body["user_id"], "is_bot": False, "first_name": "A"},
                    "is_anonymous": False,
                }
            return {
                "status": "member",
                "user": {"id": body["user_id"], "is_bot": False, "first_name": "U"},
            }
        if method == "sendMessage":
            return {
                "message_id": next(self._ids),
                "date": 1_790_000_000,
                "chat": {"id": body["chat_id"], "type": "supergroup", "title": "группа"},
                "from": BOT,
                "text": body["text"],
            }
        return True

    async def handle(self, request: web.Request) -> web.StreamResponse:
        method = request.match_info["method"]
        body = json.loads(await request.text() or "{}")
        self.calls.append((method, body))
        handler = self.handlers.get(method)
        result = handler(body) if handler else self._default(method, body)
        if inspect.isawaitable(result):
            result = await result
        if isinstance(result, web.StreamResponse):
            return result
        return web.json_response({"ok": True, "result": result})


def group_message(
    message_id: int,
    text: str | None = "привет",
    *,
    user_id: int = 7,
    first_name: str = "Тока",
    chat_id: int = GROUP_ID,
    reply_to: dict[str, Any] | None = None,
    **extra: Any,
) -> dict[str, Any]:
    message: dict[str, Any] = {
        "message_id": message_id,
        "date": 1_790_000_000,
        "chat": {"id": chat_id, "type": "supergroup", "title": "группа"},
        "from": {
            "id": user_id,
            "is_bot": False,
            "first_name": first_name,
            "username": "secret_username",
        },
        **extra,
    }
    if text is not None:
        message["text"] = text
        if text.startswith("/"):
            command = text.split()[0]
            message["entities"] = [{"type": "bot_command", "offset": 0, "length": len(command)}]
    if reply_to is not None:
        message["reply_to_message"] = reply_to
    return {"update_id": message_id, "message": message}
