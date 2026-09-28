import re
import unicodedata

from .errors import InvalidInput
from .limits import LIMITS, RESERVED_FRAGMENTS, RESERVED_NICKS, Limits

# Невидимые и управляющие направлением символы: ими подделывают ники и ломают вёрстку.
_INVISIBLE = re.compile("[​-‏‪-‮⁠-⁤⁦-⁯﻿­᠎]")
_NICK_ALLOWED = re.compile(r"^[\w .\-]+$")
_SPACES = re.compile(r"[ \t ]+")
_MANY_NEWLINES = re.compile(r"\n{3,}")

_MENTION = re.compile(r"(?<![\w.])@[A-Za-z0-9_]{3,}")
_TLDS = (
    "com|ru|net|org|io|me|dev|app|site|xyz|info|su|рф|co|gg|tv|ly|to|cc|uk|de|ua|by|kz|pro|online"
    "|store|shop|club|top|link|click|live|space|tech|ai|biz|cn|jp|us|eu|fm|sh|so|ws|gl|im|in|onion"
)
_LINK = re.compile(
    rf"(?:https?://|www\.|tg://|t\.me/|telegram\.me/)|\b[\w-]+(?:\.[\w-]+)*\.(?:{_TLDS})\b(?:/|$|[^\w])",
    re.IGNORECASE,
)

# Кириллица и цифры, похожие на латиницу, сводятся к одному «скелету»: «Sеlf» = «Self».
_HOMOGLYPHS = str.maketrans(
    {
        "а": "a",
        "в": "b",
        "е": "e",
        "ё": "e",
        "з": "3",
        "и": "u",
        "й": "u",
        "к": "k",
        "м": "m",
        "н": "h",
        "о": "o",
        "р": "p",
        "с": "c",
        "т": "t",
        "у": "y",
        "х": "x",
        "ь": "b",
        "і": "i",
        "ѕ": "s",
        "ј": "j",
        "0": "o",
        "1": "l",
        "|": "l",
        "!": "i",
        "$": "s",
        "@": "a",
    }
)


def skeleton(value: str) -> str:
    folded = unicodedata.normalize("NFKC", value).casefold().translate(_HOMOGLYPHS)
    folded = folded.replace("3", "e").replace("i", "l")
    return re.sub(r"[\W_]+", "", folded)


_RESERVED = {skeleton(nick) for nick in RESERVED_NICKS}
_RESERVED_PARTS = tuple(skeleton(part) for part in RESERVED_FRAGMENTS)


def _base_clean(value: str) -> str:
    value = unicodedata.normalize("NFKC", value)
    value = _INVISIBLE.sub("", value)
    return "".join(ch for ch in value if ch == "\n" or unicodedata.category(ch)[0] != "C")


def clean_nick(raw: str, *, limits: Limits = LIMITS, extra_reserved: tuple[str, ...] = ()) -> str:
    nick = _SPACES.sub(" ", _base_clean(raw).replace("\n", " ")).strip()
    length = len(nick)
    if length < limits.nick_min or length > limits.nick_max:
        raise InvalidInput(
            f"Ник — от {limits.nick_min} до {limits.nick_max} символов", field="nick"
        )
    if not _NICK_ALLOWED.match(nick):
        raise InvalidInput("В нике только буквы, цифры, пробел, точка, дефис и _", field="nick")

    shape = skeleton(nick)
    reserved = _RESERVED | {skeleton(name) for name in extra_reserved}
    if not shape or shape in reserved or any(part in shape for part in _RESERVED_PARTS):
        raise InvalidInput("Этот ник занят", field="nick")
    return nick


def clean_text(raw: str, *, limits: Limits = LIMITS) -> str:
    lines = [
        _SPACES.sub(" ", line).strip() for line in _base_clean(raw).replace("\r", "").split("\n")
    ]
    text = _MANY_NEWLINES.sub("\n\n", "\n".join(lines)).strip()
    if not text:
        raise InvalidInput("Пустое сообщение", field="text")
    if len(text) > limits.text_max:
        raise InvalidInput(f"Не больше {limits.text_max} символов", field="text")
    if text.startswith("/"):
        raise InvalidInput("Команды боту с сайта не отправляются", field="text")
    if _MENTION.search(text):
        raise InvalidInput("Упоминания через @ с сайта нельзя", field="text")
    if _LINK.search(text):
        raise InvalidInput("Ссылки с сайта нельзя", field="text")
    return text


def utf16_length(value: str) -> int:
    # Смещения entities в Telegram считаются в кодовых единицах UTF-16, а не в символах.
    return len(value.encode("utf-16-le")) // 2
