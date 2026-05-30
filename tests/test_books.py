import pytest
from httpx import ASGITransport, AsyncClient


async def register_and_login(
    client: AsyncClient,
    email: str,
    password: str = "supersecret",
) -> str:
    await client.post(
        "/api/v1/users",
        json={
            "email": email,
            "password": password,
            "full_name": "Reader",
        },
    )
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )
    return response.json()["access_token"]


@pytest.mark.anyio
async def test_create_and_list_books_for_authenticated_user(
    test_app,
    override_get_db,
) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=test_app),
        base_url="http://test",
    ) as client:
        token = await register_and_login(client, "reader@example.com")

        create_response = await client.post(
            "/api/v1/books",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "title": "Clean Code",
                "author": "Robert C. Martin",
                "publication_year": 2008,
                "is_read": True,
            },
        )
        list_response = await client.get(
            "/api/v1/books",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert create_response.status_code == 201
    created = create_response.json()
    assert created["title"] == "Clean Code"
    assert created["author"] == "Robert C. Martin"
    assert created["is_read"] is True

    assert list_response.status_code == 200
    books = list_response.json()
    assert len(books) == 1
    assert books[0]["title"] == "Clean Code"


@pytest.mark.anyio
async def test_books_are_scoped_to_authenticated_user(test_app, override_get_db) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=test_app),
        base_url="http://test",
    ) as client:
        first_token = await register_and_login(client, "first@example.com")
        second_token = await register_and_login(client, "second@example.com")

        create_response = await client.post(
            "/api/v1/books",
            headers={"Authorization": f"Bearer {first_token}"},
            json={"title": "Domain-Driven Design", "author": "Eric Evans"},
        )
        book_id = create_response.json()["id"]

        second_user_list = await client.get(
            "/api/v1/books",
            headers={"Authorization": f"Bearer {second_token}"},
        )
        forbidden_update = await client.patch(
            f"/api/v1/books/{book_id}",
            headers={"Authorization": f"Bearer {second_token}"},
            json={"title": "Not mine"},
        )

    assert second_user_list.status_code == 200
    assert second_user_list.json() == []
    assert forbidden_update.status_code == 404
    assert forbidden_update.json() == {"detail": "Book not found."}


@pytest.mark.anyio
async def test_books_require_authentication(test_app, override_get_db) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=test_app),
        base_url="http://test",
    ) as client:
        response = await client.get("/api/v1/books")

    assert response.status_code == 401
