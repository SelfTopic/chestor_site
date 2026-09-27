from dataclasses import dataclass
from typing import Any, Literal

Source = Literal["telegram", "site"]
MediaKind = Literal["photo", "sticker"]


@dataclass(frozen=True)
class Quote:
    author: str
    text: str


# Что сайт знает о картинке: свой ключ вместо file_id Telegram и размеры для вёрстки.
@dataclass(frozen=True)
class Media:
    key: str
    kind: MediaKind
    width: int
    height: int

    def to_json(self) -> dict[str, Any]:
        return {"key": self.key, "kind": self.kind, "width": self.width, "height": self.height}

    @classmethod
    def from_json(cls, data: dict[str, Any]) -> "Media":
        return cls(
            key=data["key"], kind=data["kind"], width=int(data["width"]), height=int(data["height"])
        )


@dataclass(frozen=True)
class MediaRef:
    file_id: str
    kind: MediaKind
    width: int
    height: int


@dataclass(frozen=True)
class ChatMessage:
    id: str
    source: Source
    author: str
    text: str
    ts: float
    quote: Quote | None = None
    client_id: str | None = None
    media: Media | None = None

    def to_json(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "source": self.source,
            "author": self.author,
            "text": self.text,
            "ts": self.ts,
            "quote": {"author": self.quote.author, "text": self.quote.text} if self.quote else None,
            "client_id": self.client_id,
            "media": self.media.to_json() if self.media else None,
        }

    @classmethod
    def from_json(cls, data: dict[str, Any]) -> "ChatMessage":
        quote = data.get("quote")
        media = data.get("media")
        return cls(
            id=str(data["id"]),
            source=data["source"],
            author=str(data["author"]),
            text=str(data["text"]),
            ts=float(data["ts"]),
            quote=Quote(author=str(quote["author"]), text=str(quote["text"])) if quote else None,
            client_id=data.get("client_id"),
            media=Media.from_json(media) if media else None,
        )


@dataclass(frozen=True)
class SiteSender:
    ip_hash: str
    pass_id: str | None


# Что бот отправил в группу от имени ника: по нему работают /ban ответом и цитаты.
@dataclass(frozen=True)
class RelayRecord:
    nick: str
    text: str
    ip_hash: str
    pass_id: str | None

    def to_json(self) -> dict[str, Any]:
        return {
            "nick": self.nick,
            "text": self.text,
            "ip_hash": self.ip_hash,
            "pass_id": self.pass_id,
        }

    @classmethod
    def from_json(cls, data: dict[str, Any]) -> "RelayRecord":
        return cls(
            nick=data["nick"],
            text=data["text"],
            ip_hash=data["ip_hash"],
            pass_id=data.get("pass_id"),
        )


@dataclass(frozen=True)
class IncomingMessage:
    tg_message_id: int
    author: str
    text: str
    ts: float
    reply_to_tg_id: int | None = None
    reply_author: str | None = None
    reply_text: str | None = None
    reply_is_ours: bool = False
    media: MediaRef | None = None


@dataclass(frozen=True)
class Question:
    id: int
    text: str
    options: tuple[str, ...]
    answer: str | None = None
