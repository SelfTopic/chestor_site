import asyncio
import contextlib
import logging
import time
from collections.abc import Callable

from aiohttp import web

from .api.hub import WebSocketHub
from .api.routes import DEPS, Deps, chat_errors, setup_routes
from .config import Settings
from .limits import LIMITS, Limits
from .mock import MockGroup
from .security import PassSigner
from .services.captcha import CaptchaService
from .services.chat import ChatService
from .services.media import MediaFetcher, MediaService
from .services.moderation import ModerationService
from .services.outbox import Outbox
from .services.ports import GroupGateway
from .services.quiz import FixtureSource, GhoulQuizSource, QuestionSource
from .storage import MemoryStorage, Storage
from .storage.redis_store import RedisStorage
from .telegram.bot import BotDeps, ChatDispatcher
from .telegram.gateway import TelegramGateway

logger = logging.getLogger(__name__)

BOT_TASK = web.AppKey("bot_task", asyncio.Task[None])
OUTBOX = web.AppKey("outbox", Outbox)


def build_storage(settings: Settings) -> Storage:
    return RedisStorage.from_url(settings.redis_url) if settings.redis_url else MemoryStorage()


def build_quiz_source(settings: Settings) -> QuestionSource:
    fixture = FixtureSource(settings.quiz_fixture_path)
    if settings.ghoul_quiz_email:
        live = GhoulQuizSource.connect(
            settings.ghoul_quiz_email, settings.ghoul_quiz_api_url, fixture
        )
        if live is not None:
            return live
    return fixture


def create_app(
    settings: Settings | None = None,
    *,
    storage: Storage | None = None,
    quiz_source: QuestionSource | None = None,
    media_fetcher: MediaFetcher | None = None,
    limits: Limits = LIMITS,
    clock: Callable[[], float] = time.time,
    start_bot: bool = True,
) -> web.Application:
    settings = settings or Settings()
    storage = storage or build_storage(settings)
    quiz_source = quiz_source or build_quiz_source(settings)
    hub = WebSocketHub()
    reserved = (settings.bot_username,) if settings.bot_username else ()
    chat = ChatService(storage, hub, limits, reserved_nicks=reserved, clock=clock)
    moderation = ModerationService(storage, clock=clock)
    signer = PassSigner(settings.pass_secret)
    captcha = CaptchaService(storage, quiz_source, signer, limits, clock=clock)

    mock: MockGroup | None = None
    dispatcher: ChatDispatcher | None = None
    gateway: GroupGateway
    fetcher = media_fetcher
    if settings.chat_mode == "telegram":
        assert settings.bot_token and settings.chat_id is not None
        dispatcher = ChatDispatcher(
            settings.bot_token,
            BotDeps(chat, moderation, settings.chat_id, show_media=settings.show_media),
            polling=settings.is_dev,
        )
        telegram_gateway = TelegramGateway(dispatcher.api, settings.chat_id)
        gateway = telegram_gateway
        fetcher = fetcher or telegram_gateway
    else:
        mock = MockGroup()
        mock.chat = chat
        gateway = mock
        fetcher = fetcher or mock

    outbox = Outbox(gateway, limits, on_sent=chat.on_sent)
    chat.outbox = outbox

    app = web.Application(middlewares=[chat_errors], client_max_size=limits.body_max_bytes)
    app[DEPS] = Deps(
        settings=settings,
        limits=limits,
        chat=chat,
        captcha=captcha,
        hub=hub,
        signer=signer,
        clock=clock,
        media=MediaService(storage, fetcher, limits, clock=clock),
    )
    setup_routes(app)
    app[OUTBOX] = outbox

    async def on_startup(app: web.Application) -> None:
        outbox.start()
        if mock is not None:
            await mock.seed()
            if start_bot:
                mock.start()
        if dispatcher is not None and start_bot:
            if settings.is_dev:
                task = asyncio.create_task(dispatcher.polling(), name="bot-polling")
            else:
                assert settings.webhook_url and settings.webhook_secret
                task = asyncio.create_task(
                    dispatcher.webhook(
                        url=settings.webhook_url,
                        secret_token=settings.webhook_secret,
                        host="0.0.0.0",
                        port=settings.webhook_port,
                    ),
                    name="bot-webhook",
                )
            app[BOT_TASK] = task

    async def on_cleanup(app: web.Application) -> None:
        task = app.get(BOT_TASK)
        if task is not None:
            task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await task
        if mock is not None:
            await mock.stop()
        await outbox.stop()
        await hub.close_all()
        await quiz_source.close()
        await storage.close()
        if dispatcher is not None and task is None:
            await dispatcher.api.close_session()

    app.on_startup.append(on_startup)
    app.on_cleanup.append(on_cleanup)
    return app
