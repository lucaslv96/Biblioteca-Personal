import pytest
from httpx import ASGITransport, AsyncClient


@pytest.mark.anyio
async def test_login_returns_access_token_for_valid_credentials(
    test_app,
    override_get_db,
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=test_app),
        base_url="http://test",
    ) as client:
        await client.post(
            "/api/users",
            json={
                "email": "lucas@example.com",
                "password": "supersecret",
                "full_name": "Lucas",
            },
        )

        response = await client.post(
            "/api/auth/login",
            json={
                "email": "lucas@example.com",
                "password": "supersecret",
            },
        )

    assert response.status_code == 200
    body = response.json()
    assert body["access_token"]
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == "lucas@example.com"
    assert "hashed_password" not in body["user"]


@pytest.mark.anyio
async def test_login_rejects_invalid_credentials(test_app, override_get_db) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=test_app),
        base_url="http://test",
    ) as client:
        await client.post(
            "/api/users",
            json={
                "email": "lucas@example.com",
                "password": "supersecret",
                "full_name": "Lucas",
            },
        )

        response = await client.post(
            "/api/auth/login",
            json={
                "email": "lucas@example.com",
                "password": "wrongsecret",
            },
        )

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid email or password."}
