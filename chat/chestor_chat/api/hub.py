import asyncio
import contextlib
import json
import logging
from collections import Counter
from typing import Any

from aiohttp import web

from ..models import ChatMessage

logger = logging.getLogger(__name__)


class WebSocketHub:
    def __init__(self) -> None:
        self._sockets: dict[web.WebSocketResponse, str] = {}
        self._per_ip: Counter[str] = Counter()

    @property
    def online(self) -> int:
        return len(self._sockets)

    def connections_from(self, ip_hash: str) -> int:
        return self._per_ip[ip_hash]

    async def add(self, socket: web.WebSocketResponse, ip_hash: str) -> None:
        self._sockets[socket] = ip_hash
        self._per_ip[ip_hash] += 1

    async def remove(self, socket: web.WebSocketResponse) -> None:
        if socket in self._sockets:
            self._forget(socket)
            await self.broadcast_online()

    async def broadcast_online(self) -> None:
        await self.broadcast({"type": "online", "count": self.online})

    async def message(self, message: ChatMessage) -> None:
        await self.broadcast({"type": "message", "message": message.to_json()})

    async def broadcast(self, event: dict[str, Any]) -> None:
        if not self._sockets:
            return
        payload = json.dumps(event, ensure_ascii=False)
        sockets = list(self._sockets)
        results = await asyncio.gather(
            *(socket.send_str(payload) for socket in sockets), return_exceptions=True
        )
        for socket, result in zip(sockets, results, strict=True):
            if isinstance(result, Exception):
                logger.debug("WS отвалился при рассылке: %s", result)
                self._forget(socket)

    def _forget(self, socket: web.WebSocketResponse) -> None:
        ip_hash = self._sockets.pop(socket, None)
        if ip_hash is not None:
            self._per_ip[ip_hash] -= 1
            if self._per_ip[ip_hash] <= 0:
                del self._per_ip[ip_hash]

    async def close_all(self) -> None:
        for socket in list(self._sockets):
            with contextlib.suppress(Exception):
                await socket.close(code=1001, message=b"server shutdown")
        self._sockets.clear()
        self._per_ip.clear()
