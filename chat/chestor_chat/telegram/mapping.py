from selfrot.types import Message

from ..models import IncomingMessage, MediaRef

# Медиа на сайт не тянем (приватность и трафик): только подпись-заглушка.
MEDIA_LABELS: tuple[tuple[str, str], ...] = (
    ("sticker", "[стикер]"),
    ("photo", "[фото]"),
    ("live_photo", "[фото]"),
    ("video", "[видео]"),
    ("animation", "[гифка]"),
    ("video_note", "[кружок]"),
    ("voice", "[голосовое]"),
    ("audio", "[аудио]"),
    ("document", "[файл]"),
    ("poll", "[опрос]"),
    ("location", "[геопозиция]"),
    ("venue", "[место]"),
    ("contact", "[контакт]"),
    ("dice", "[кубик]"),
    ("paid_media", "[платное медиа]"),
    ("story", "[история]"),
    ("checklist", "[чек-лист]"),
)


def message_text(message: Message) -> str | None:
    label = next((text for field, text in MEDIA_LABELS if getattr(message, field, None)), None)
    body = message.text or message.caption
    if label and body:
        return f"{label} {body}"
    return label or body


def author_name(message: Message) -> str:
    if message.sender_chat is not None and message.sender_chat.title:
        return message.sender_chat.title
    if message.user is not None:
        return message.user.first_name
    return "Кто-то"


def media_ref(message: Message, max_side: int = 1280) -> MediaRef | None:
    if message.photo:
        # Самый крупный размер, влезающий в max_side: превью Telegram для сайта хватает.
        fitting = [size for size in message.photo if max(size.width, size.height) <= max_side]
        size = max(fitting or message.photo[:1], key=lambda item: item.width * item.height)
        return MediaRef(file_id=size.file_id, kind="photo", width=size.width, height=size.height)
    sticker = message.sticker
    if sticker is not None:
        if not sticker.is_animated and not sticker.is_video:
            return MediaRef(
                file_id=sticker.file_id, kind="sticker", width=sticker.width, height=sticker.height
            )
        if sticker.thumbnail is not None:
            thumb = sticker.thumbnail
            return MediaRef(
                file_id=thumb.file_id, kind="sticker", width=thumb.width, height=thumb.height
            )
    return None


def to_incoming(message: Message, bot_id: int, with_media: bool = False) -> IncomingMessage | None:
    media = media_ref(message) if with_media else None
    text = (message.caption or "") if media is not None else message_text(message)
    if text is None:
        return None
    reply = message.reply_to_message
    return IncomingMessage(
        tg_message_id=message.message_id,
        author=author_name(message),
        text=text,
        ts=float(message.date),
        reply_to_tg_id=reply.message_id if reply else None,
        reply_author=author_name(reply) if reply else None,
        reply_text=(message_text(reply) or "") if reply else None,
        reply_is_ours=bool(reply and reply.user and reply.user.id == bot_id),
        media=media,
    )
