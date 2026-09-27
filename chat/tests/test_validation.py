import pytest

from chestor_chat.errors import InvalidInput
from chestor_chat.validation import clean_nick, clean_text, skeleton, utf16_length


@pytest.mark.parametrize(
    "raw, expected", [("  Канеки  ", "Канеки"), ("Ghoul_99", "Ghoul_99"), ("Ку ку", "Ку ку")]
)
def test_nick_ok(raw: str, expected: str) -> None:
    assert clean_nick(raw) == expected


@pytest.mark.parametrize("raw", ["к", "x" * 25, "", "   ", "a<b>", "\u202e", "эмодзи🦴"])
def test_nick_rejected(raw: str) -> None:
    with pytest.raises(InvalidInput) as error:
        clean_nick(raw)
    assert error.value.field == "nick"


@pytest.mark.parametrize(
    "raw",
    [
        "Self",
        "self",
        "SELF",
        "Sеlf",
        "CheStor",
        "Che_Stor",
        "chestor official",
        "admin",
        "Админ Вася",
        "s e l f",
        "бот",
    ],
)
def test_reserved_nicks(raw: str) -> None:
    with pytest.raises(InvalidInput, match="занят"):
        clean_nick(raw)


def test_extra_reserved_bot_username() -> None:
    with pytest.raises(InvalidInput):
        clean_nick("true_hax0r_bot", extra_reserved=("true_hax0r_bot",))


def test_invisible_chars_are_stripped_before_checks() -> None:
    assert clean_nick("Ка\u200bнеки") == "Канеки"
    assert clean_nick("ник\u202e") == "ник"
    with pytest.raises(InvalidInput):
        clean_nick("Se\u200blf")


def test_homoglyph_skeleton() -> None:
    assert skeleton("Sеlf") == skeleton("self")  # кириллическая «е»
    assert skeleton("CHE$TOR") == skeleton("chestor")


def test_text_is_cleaned() -> None:
    assert clean_text("  привет   мир  ") == "привет мир"
    assert clean_text("a\n\n\n\n\nb") == "a\n\nb"
    assert clean_text("x​y") == "xy"


@pytest.mark.parametrize(
    "raw, reason",
    [
        ("", "Пустое"),
        ("   \n  ", "Пустое"),
        ("x" * 301, "300"),
        ("/start", "Команды"),
        ("/ban@true_hax0r_bot", "Команды"),
        ("привет @durov", "Упоминания"),
        ("смотри https://example.org", "Ссылки"),
        ("зайди на www.site.ru", "Ссылки"),
        ("t.me/joinchat/abc", "Ссылки"),
        ("мой сайт chestor.site", "Ссылки"),
        ("ghoul.ru/путь", "Ссылки"),
        ("tg://resolve?domain=x", "Ссылки"),
    ],
)
def test_text_rejected(raw: str, reason: str) -> None:
    with pytest.raises(InvalidInput, match=reason):
        clean_text(raw)


@pytest.mark.parametrize(
    "raw",
    [
        "т.е. всё ок",
        "и т.д.",
        "main.py упал",
        "email не дам",
        "1000-7",
        "<b>жирный</b>",
        "*не* _курсив_",
    ],
)
def test_text_allowed(raw: str) -> None:
    assert clean_text(raw) == raw


def test_formatting_is_kept_as_plain_text() -> None:
    # HTML и markdown не вырезаются и не исполняются: в Telegram уходят как есть, без parse_mode.
    assert clean_text("<a href='x'>y</a>") == "<a href='x'>y</a>"


def test_utf16_length_counts_surrogate_pairs() -> None:
    assert utf16_length("Канеки") == 6
    assert utf16_length("a🦴") == 3
