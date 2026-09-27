from aiohttp.test_utils import TestClient, TestServer

from chestor_chat.app import create_app


async def test_health() -> None:
    async with TestClient(TestServer(create_app())) as client:
        response = await client.get("/chat/health")
        assert response.status == 200
        assert await response.json() == {"ok": True}
