import json
import logging
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from aiohttp import WSMsgType, web

from ..config import Settings
from ..errors import ChatError, InvalidInput
from ..limits import Limits
from ..models import SiteSender
from ..security import PassSigner, hash_ip
from ..services.captcha import CaptchaService
from ..services.chat import ChatService
from ..services.media import MediaService
from ..validation import clean_nick
from .hub import WebSocketHub

logger = logging.getLogger(__name__)

PASS_COOKIE = "chestor_pass"


@dataclass
class Deps:
    settings: Settings
    limits: Limits
    chat: ChatService
    captcha: CaptchaService
    hub: WebSocketHub
    signer: PassSigner
    clock: Callable[[], float]
    media: MediaService


DEPS = web.AppKey("deps", Deps)


def _deps(request: web.Request) -> Deps:
    return request.app[DEPS]


def client_ip(request: web.Request, trust_proxy: bool) -> str:
    # За nginx настоящий адрес лежит в X-Real-IP; без trust_proxy заголовкам не верим.
    if trust_proxy:
        real = request.headers.get("X-Real-IP") or request.headers.get("X-Forwarded-For", "")
        ip = real.split(",")[0].strip()
        if ip:
            return ip
    return request.remote or "unknown"


def _sender(request: web.Request, deps: Deps) -> SiteSender:
    ip_hash = hash_ip(client_ip(request, deps.settings.trust_proxy), deps.settings.ip_hash_salt)
    valid = deps.signer.verify(request.cookies.get(PASS_COOKIE), deps.clock())
    return SiteSender(ip_hash=ip_hash, pass_id=valid.pass_id if valid else None)


def error_response(error: ChatError) -> web.Response:
    body: dict[str, Any] = {"code": error.code, "message": error.message}
    if error.retry_after is not None:
        body["retry_after"] = error.retry_after
    if error.field is not None:
        body["field"] = error.field
    headers = {"Retry-After": str(int(error.retry_after) + 1)} if error.retry_after else None
    return web.json_response({"error": body}, status=error.status, headers=headers)


async def _json_body(request: web.Request) -> dict[str, Any]:
    # Только application/json: простые кросс-доменные формы (text/plain) сюда не пройдут.
    if request.content_type != "application/json":
        raise InvalidInput("Ожидается application/json")
    try:
        data = await request.json()
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise InvalidInput("Ожидается JSON") from None
    if not isinstance(data, dict):
        raise InvalidInput("Ожидается объект JSON")
    return data


@web.middleware
async def chat_errors(request: web.Request, handler: Any) -> web.StreamResponse:
    try:
        return await handler(request)
    except ChatError as error:
        return error_response(error)


async def health(_request: web.Request) -> web.Response:
    return web.json_response({"ok": True})


async def history(request: web.Request) -> web.Response:
    deps = _deps(request)
    messages = await deps.chat.history()
    valid = deps.signer.verify(request.cookies.get(PASS_COOKIE), deps.clock())
    return web.json_response(
        {
            "messages": [message.to_json() for message in messages],
            "online": deps.hub.online,
            "mode": deps.settings.chat_mode,
            "captcha": deps.captcha.source.name,
            "muted_until": await deps.chat.muted_until(),
            "pass_expires_at": valid.expires_at if valid else None,
            "limits": {
                "nick_min": deps.limits.nick_min,
                "nick_max": deps.limits.nick_max,
                "text_max": deps.limits.text_max,
            },
        },
        headers={"Cache-Control": "no-store"},
    )


async def send(request: web.Request) -> web.Response:
    deps = _deps(request)
    data = await _json_body(request)
    nick, text, client_id = data.get("nick"), data.get("text"), data.get("client_id")
    if not isinstance(nick, str) or not isinstance(text, str):
        raise InvalidInput("Нужны nick и text")
    if client_id is not None and (not isinstance(client_id, str) or len(client_id) > 64):
        raise InvalidInput("client_id — строка до 64 символов")
    position = await deps.chat.submit(_sender(request, deps), nick, text, client_id)
    return web.json_response({"ok": True, "queued": position}, status=202)


async def captcha_question(request: web.Request) -> web.Response:
    deps = _deps(request)
    challenge = await deps.captcha.challenge(_sender(request, deps).ip_hash)
    return web.json_response(challenge.to_json(), headers={"Cache-Control": "no-store"})


async def captcha_answer(request: web.Request) -> web.Response:
    deps = _deps(request)
    data = await _json_body(request)
    challenge_id, answer = data.get("challenge_id"), data.get("answer")
    if not isinstance(challenge_id, str) or not isinstance(answer, str):
        raise InvalidInput("Нужны challenge_id и answer")
    verdict = await deps.captcha.verify(challenge_id, answer, _sender(request, deps).ip_hash)
    response = web.json_response(
        {
            "correct": verdict.correct,
            "answer": verdict.answer,
            "pass_expires_at": verdict.pass_.expires_at if verdict.pass_ else None,
        }
    )
    if verdict.pass_ is not None:
        response.set_cookie(
            PASS_COOKIE,
            verdict.pass_.token,
            max_age=deps.limits.pass_ttl,
            path="/chat",
            httponly=True,
            samesite="Lax",
            secure=not deps.settings.is_dev,
        )
    return response


# «Печатает…» шлют только прошедшие капчу, не чаще раза в 2 с с одного сокета.
TYPING_EVERY = 2.0


def typing_nick(raw: str, deps: Deps) -> str | None:
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return None
    if (
        not isinstance(data, dict)
        or data.get("type") != "typing"
        or not isinstance(data.get("nick"), str)
    ):
        return None
    try:
        return clean_nick(data["nick"], limits=deps.limits)
    except InvalidInput:
        return None


async def websocket(request: web.Request) -> web.StreamResponse:
    deps = _deps(request)
    ip_hash = _sender(request, deps).ip_hash
    if (
        deps.hub.online >= deps.limits.ws_total
        or deps.hub.connections_from(ip_hash) >= deps.limits.ws_per_ip
    ):
        return web.json_response({"error": {"code": "too_many_connections"}}, status=429)

    sender = _sender(request, deps)
    socket = web.WebSocketResponse(heartbeat=30, max_msg_size=1024)
    await socket.prepare(request)
    await deps.hub.add(socket, ip_hash)
    last_typing = 0.0
    try:
        await socket.send_json(
            {"type": "hello", "online": deps.hub.online, "mode": deps.settings.chat_mode}
        )
        await deps.hub.broadcast_online()
        async for message in socket:
            # Клиент ничего не шлёт, кроме ping: отправка идёт через POST /chat/send.
            if message.type == WSMsgType.TEXT and message.data == "ping":
                await socket.send_str('{"type":"pong"}')
            elif message.type == WSMsgType.TEXT and sender.pass_id is not None:
                now = deps.clock()
                if now - last_typing >= TYPING_EVERY:
                    nick = typing_nick(message.data, deps)
                    if nick is not None:
                        last_typing = now
                        await deps.hub.typing(nick, exclude=socket)
            elif message.type == WSMsgType.ERROR:
                break
    finally:
        await deps.hub.remove(socket)
    return socket


async def media(request: web.Request) -> web.Response:
    deps = _deps(request)
    data, content_type = await deps.media.get(
        request.match_info["key"], _sender(request, deps).ip_hash
    )
    return web.Response(
        body=data,
        content_type=content_type,
        headers={
            "Cache-Control": "public, max-age=604800, immutable",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'",
        },
    )


def setup_routes(app: web.Application) -> None:
    app.router.add_get("/chat/health", health)
    app.router.add_get("/chat/history", history)
    app.router.add_post("/chat/send", send)
    app.router.add_get("/chat/captcha", captcha_question)
    app.router.add_post("/chat/captcha", captcha_answer)
    app.router.add_get("/chat/ws", websocket)
    app.router.add_get("/chat/media/{key:[A-Za-z0-9_-]{16,64}}", media)
