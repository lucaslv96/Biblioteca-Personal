import pytest
from httpx import ASGITransport, AsyncClient


@pytest.mark.anyio
async def test_create_user_returns_public_user_data(test_app, override_get_db) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=test_app),
        base_url="http://test",
    ) as client:
        response = await client.post(
            "/api/v1/users",
            json={
                "email": "Lucas@example.com",
                "password": "supersecret",
                "full_name": "Lucas",
            },
        )

    assert response.status_code == 201
    body = response.json()
    assert body["id"] == 1
    assert body["email"] == "lucas@example.com"
    assert body["full_name"] == "Lucas"
    assert body["is_active"] is True
    assert "hashed_password" not in body
    assert "password" not in body


@pytest.mark.anyio
async def test_create_user_rejects_duplicated_email(test_app, override_get_db) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=test_app),
        base_url="http://test",
    ) as client:
        payload = {
            "email": "lucas@example.com",
            "password": "supersecret",
            "full_name": "Lucas",
        }

        first_response = await client.post("/api/v1/users", json=payload)
        second_response = await client.post("/api/v1/users", json=payload)

    assert first_response.status_code == 201
    assert second_response.status_code == 409
    assert second_response.json() == {
        "detail": "A user with this email already exists.",
    }
