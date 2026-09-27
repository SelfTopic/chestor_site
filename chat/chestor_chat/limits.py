from dataclasses import dataclass


# Все числа ограничений в одном месте: сайт не должен уронить бота за флуд.
@dataclass(frozen=True)
class Limits:
    nick_min: int = 2
    nick_max: int = 24
    text_max: int = 300

    # На IP и на пропуск отдельно.
    send_burst: int = 1
    send_burst_window: int = 10
    send_hourly: int = 20
    send_hourly_window: int = 3600

    # Telegram режет ~20 сообщений в минуту на группу; оставляем запас.
    group_per_minute: int = 15
    queue_max: int = 30

    history_size: int = 100
    history_page: int = 100

    pass_ttl: int = 6 * 3600
    challenge_ttl: int = 600
    captcha_questions_hourly: int = 30
    captcha_attempts: int = 10
    captcha_attempts_window: int = 600

    ws_per_ip: int = 5
    ws_total: int = 500
    body_max_bytes: int = 16 * 1024


LIMITS = Limits()

RESERVED_NICKS: tuple[str, ...] = (
    "self",
    "self topic",
    "selftopic",
    "chestor",
    "chestor bot",
    "chestor chat bot",
    "admin",
    "administrator",
    "админ",
    "администратор",
    "модератор",
    "moderator",
    "owner",
    "владелец",
    "system",
    "система",
    "telegram",
    "бот",
    "bot",
    "true hax0r bot",
)

# Эти слова запрещены и как часть ника: «CheStor_official», «Админ Вася».
RESERVED_FRAGMENTS: tuple[str, ...] = ("chestor", "selftopic", "admin", "админ", "модер", "moder")
