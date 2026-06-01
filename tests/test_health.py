import pytest
from httpx import ASGITransport, AsyncClient


@pytest.mark.anyio
async def test_health_check_returns_api_status(test_app) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=test_app),
        base_url="http://test",
    ) as client:
        response = await client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "Biblioteca Personal API",
        "version": "0.1.0",
    }
