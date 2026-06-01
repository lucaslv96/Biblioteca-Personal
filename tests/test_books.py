import pytest
from httpx import ASGITransport, AsyncClient

from app.api.endpoints.books import get_book_cover_search_service
from app.schemas.book import BookCoverCandidate


async def register_and_login(
    client: AsyncClient,
    email: str,
    password: str = "supersecret",
) -> str:
    await client.post(
        "/api/users",
        json={
            "email": email,
            "password": password,
            "full_name": "Reader",
        },
    )
    response = await client.post(
        "/api/auth/login",
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
            "/api/books",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "title": "Clean Code",
                "author": "Robert C. Martin",
                "isbn": "9780132350884",
                "publication_year": 2008,
                "cover_url": "https://covers.openlibrary.org/b/id/123-L.jpg",
                "cover_source": "open_library",
                "external_id": "/works/OL123W",
                "is_read": True,
            },
        )
        list_response = await client.get(
            "/api/books",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert create_response.status_code == 201
    created = create_response.json()
    assert created["title"] == "Clean Code"
    assert created["author"] == "Robert C. Martin"
    assert created["isbn"] == "9780132350884"
    assert created["cover_url"] == "https://covers.openlibrary.org/b/id/123-L.jpg"
    assert created["cover_source"] == "open_library"
    assert created["external_id"] == "/works/OL123W"
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
            "/api/books",
            headers={"Authorization": f"Bearer {first_token}"},
            json={"title": "Domain-Driven Design", "author": "Eric Evans"},
        )
        book_id = create_response.json()["id"]

        second_user_list = await client.get(
            "/api/books",
            headers={"Authorization": f"Bearer {second_token}"},
        )
        forbidden_update = await client.patch(
            f"/api/books/{book_id}",
            headers={"Authorization": f"Bearer {second_token}"},
            json={"title": "Not mine"},
        )

    assert second_user_list.status_code == 200
    assert second_user_list.json() == []
    assert forbidden_update.status_code == 404
    assert forbidden_update.json() == {"detail": "Book not found."}


@pytest.mark.anyio
async def test_search_book_cover_candidates(test_app, override_get_db) -> None:
    class FakeBookCoverSearchService:
        async def search(
            self,
            title: str | None = None,
            author: str | None = None,
            isbn: str | None = None,
            limit: int = 8,
        ) -> list[BookCoverCandidate]:
            assert title == "Clean Code"
            assert author == "Robert C. Martin"
            assert isbn is None
            assert limit == 3
            return [
                BookCoverCandidate(
                    title="Clean Code",
                    author="Robert C. Martin",
                    isbn="9780132350884",
                    publication_year=2008,
                    cover_url="https://covers.openlibrary.org/b/id/123-L.jpg",
                    thumbnail_url="https://covers.openlibrary.org/b/id/123-M.jpg",
                    source="open_library",
                    external_id="/works/OL123W",
                )
            ]

    test_app.dependency_overrides[get_book_cover_search_service] = FakeBookCoverSearchService

    async with AsyncClient(
        transport=ASGITransport(app=test_app),
        base_url="http://test",
    ) as client:
        token = await register_and_login(client, "covers@example.com")
        response = await client.get(
            "/api/books/covers/search",
            params={"title": "Clean Code", "author": "Robert C. Martin", "limit": 3},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    candidates = response.json()
    assert candidates == [
        {
            "title": "Clean Code",
            "author": "Robert C. Martin",
            "isbn": "9780132350884",
            "publication_year": 2008,
            "cover_url": "https://covers.openlibrary.org/b/id/123-L.jpg",
            "thumbnail_url": "https://covers.openlibrary.org/b/id/123-M.jpg",
            "source": "open_library",
            "external_id": "/works/OL123W",
        }
    ]


@pytest.mark.anyio
async def test_search_book_cover_candidates_by_isbn(test_app, override_get_db) -> None:
    class FakeBookCoverSearchService:
        async def search(
            self,
            title: str | None = None,
            author: str | None = None,
            isbn: str | None = None,
            limit: int = 8,
        ) -> list[BookCoverCandidate]:
            assert title is None
            assert author is None
            assert isbn == "9780140449136"
            assert limit == 8
            return [
                BookCoverCandidate(
                    title="Crime and Punishment",
                    author="Fyodor Dostoevsky",
                    isbn="9780140449136",
                    publication_year=2002,
                    cover_url="https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg",
                    thumbnail_url="https://covers.openlibrary.org/b/isbn/9780140449136-M.jpg",
                    source="open_library",
                    external_id="/books/OL7353617M",
                )
            ]

    test_app.dependency_overrides[get_book_cover_search_service] = FakeBookCoverSearchService

    async with AsyncClient(
        transport=ASGITransport(app=test_app),
        base_url="http://test",
    ) as client:
        token = await register_and_login(client, "isbn-covers@example.com")
        response = await client.get(
            "/api/books/covers/search",
            params={"isbn": "9780140449136"},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    assert response.json()[0]["isbn"] == "9780140449136"


@pytest.mark.anyio
async def test_books_require_authentication(test_app, override_get_db) -> None:
    async with AsyncClient(
        transport=ASGITransport(app=test_app),
        base_url="http://test",
    ) as client:
        response = await client.get("/api/books")
        cover_search_response = await client.get(
            "/api/books/covers/search",
            params={"title": "Clean Code"},
        )

    assert response.status_code == 401
    assert cover_search_response.status_code == 401
