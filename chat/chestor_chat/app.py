from aiohttp import web


async def health(_request: web.Request) -> web.Response:
    return web.json_response({"ok": True})


def create_app() -> web.Application:
    app = web.Application()
    app.router.add_get("/chat/health", health)
    return app
