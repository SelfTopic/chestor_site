import logging

from aiohttp import web

from .app import create_app
from .config import Settings


def main() -> None:
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s"
    )
    settings = Settings.from_env()
    logging.getLogger(__name__).info("CHAT_MODE=%s ENV=%s", settings.chat_mode, settings.env)
    web.run_app(create_app(settings), host=settings.host, port=settings.port, access_log=None)


if __name__ == "__main__":
    main()
