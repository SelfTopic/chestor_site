import logging
import os
import secrets
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

logger = logging.getLogger(__name__)

ChatMode = Literal["mock", "telegram"]

DEFAULT_FIXTURE = (
    Path(__file__).resolve().parent.parent / "tests" / "fixtures" / "quiz_questions.json"
)


class ConfigError(Exception):
    pass


def _flag(value: str | None) -> bool:
    return (value or "").strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    chat_mode: ChatMode = "mock"
    env: str = "DEV"
    host: str = "0.0.0.0"
    port: int = 8080
    bot_token: str | None = None
    chat_id: int | None = None
    bot_username: str | None = None
    webhook_url: str | None = None
    webhook_secret: str | None = None
    webhook_port: int = 8081
    redis_url: str | None = None
    ip_hash_salt: str = field(default="", repr=False)
    pass_secret: str = field(default="", repr=False)
    trust_proxy: bool = False
    show_media: bool = False
    ghoul_quiz_email: str | None = None
    ghoul_quiz_api_url: str = "https://chestor.site/api"
    quiz_fixture_path: Path = DEFAULT_FIXTURE

    @property
    def is_dev(self) -> bool:
        return self.env.upper() == "DEV"

    @classmethod
    def from_env(cls, environ: dict[str, str] | None = None) -> "Settings":
        env = dict(os.environ if environ is None else environ)
        get = lambda name: (env.get(name) or "").strip() or None  # noqa: E731

        mode = (get("CHAT_MODE") or "mock").lower()
        if mode not in ("mock", "telegram"):
            raise ConfigError(f"CHAT_MODE: mock или telegram, а не {mode!r}")

        stage = (get("ENV") or "DEV").upper()
        chat_id_raw = get("CHAT_ID")
        try:
            chat_id = int(chat_id_raw) if chat_id_raw else None
        except ValueError as exc:
            raise ConfigError("CHAT_ID должен быть числом") from exc

        if mode == "telegram" and (not get("BOT_TOKEN") or chat_id is None):
            raise ConfigError("CHAT_MODE=telegram требует BOT_TOKEN и CHAT_ID")
        if (
            mode == "telegram"
            and stage != "DEV"
            and not (get("WEBHOOK_URL") and get("WEBHOOK_SECRET"))
        ):
            raise ConfigError("Вне DEV бот работает вебхуком: нужны WEBHOOK_URL и WEBHOOK_SECRET")

        salt = get("IP_HASH_SALT")
        pass_secret = get("PASS_SECRET")
        if stage != "DEV" and not (salt and pass_secret):
            raise ConfigError("Вне DEV нужны IP_HASH_SALT и PASS_SECRET")
        if not salt or not pass_secret:
            # В dev секреты живут до перезапуска: пропуска после рестарта станут недействительны.
            logger.warning("IP_HASH_SALT/PASS_SECRET не заданы: сгенерированы на время процесса")

        return cls(
            chat_mode=mode,  # type: ignore[arg-type]
            env=stage,
            host=get("HOST") or "0.0.0.0",
            port=int(get("PORT") or 8080),
            bot_token=get("BOT_TOKEN"),
            chat_id=chat_id,
            bot_username=get("BOT_USERNAME"),
            webhook_url=get("WEBHOOK_URL"),
            webhook_secret=get("WEBHOOK_SECRET"),
            webhook_port=int(get("WEBHOOK_PORT") or 8081),
            redis_url=get("REDIS_URL"),
            ip_hash_salt=salt or secrets.token_hex(16),
            pass_secret=pass_secret or secrets.token_hex(32),
            trust_proxy=_flag(get("TRUST_PROXY")),
            show_media=_flag(get("SHOW_MEDIA") or "0"),
            ghoul_quiz_email=get("GHOUL_QUIZ_EMAIL"),
            ghoul_quiz_api_url=get("GHOUL_QUIZ_API_URL") or "https://chestor.site/api",
            quiz_fixture_path=Path(get("QUIZ_FIXTURE_PATH") or DEFAULT_FIXTURE),
        )
