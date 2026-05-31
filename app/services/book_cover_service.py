import httpx

from app.schemas.book import BookCoverCandidate


OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json"
OPEN_LIBRARY_COVERS_URL = "https://covers.openlibrary.org/b/id/{cover_id}-{size}.jpg?default=false"
OPEN_LIBRARY_ISBN_COVERS_URL = "https://covers.openlibrary.org/b/isbn/{isbn}-{size}.jpg?default=false"


class BookCoverSearchError(Exception):
    pass


class BookCoverSearchService:
    async def search(
        self,
        title: str | None = None,
        author: str | None = None,
        isbn: str | None = None,
        limit: int = 8,
    ) -> list[BookCoverCandidate]:
        clean_isbn = self._clean_isbn(isbn)
        params: dict[str, str | int] = {
            "fields": "key,title,author_name,first_publish_year,cover_i,isbn",
            "limit": limit,
        }

        if clean_isbn:
            params["isbn"] = clean_isbn
        elif title:
            params["title"] = title
        else:
            return []

        if author and not clean_isbn:
            params["author"] = author

        try:
            async with httpx.AsyncClient(
                timeout=5.0,
                headers={"User-Agent": "BibliotecaPersonal/0.1.0"},
            ) as client:
                response = await client.get(OPEN_LIBRARY_SEARCH_URL, params=params)
                response.raise_for_status()
                data = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise BookCoverSearchError("Could not search book covers.") from exc

        return self._to_cover_candidates(data.get("docs", []), limit, clean_isbn)

    def _to_cover_candidates(
        self,
        docs: list[dict[str, object]],
        limit: int,
        query_isbn: str | None = None,
    ) -> list[BookCoverCandidate]:
        candidates: list[BookCoverCandidate] = []
        seen_cover_keys: set[str] = set()

        for doc in docs:
            cover_id = doc.get("cover_i")
            title = doc.get("title")
            candidate_isbn = query_isbn or self._first_isbn(doc.get("isbn"))
            if not isinstance(title, str):
                continue
            if not isinstance(cover_id, int) and not candidate_isbn:
                continue

            cover_key = str(cover_id or candidate_isbn)
            if cover_key in seen_cover_keys:
                continue

            seen_cover_keys.add(cover_key)
            author = self._first_author(doc.get("author_name"))
            publication_year = doc.get("first_publish_year")
            cover_url = self._cover_url(cover_id, candidate_isbn, "L")
            thumbnail_url = self._cover_url(cover_id, candidate_isbn, "M")

            candidates.append(
                BookCoverCandidate(
                    title=title,
                    author=author,
                    isbn=candidate_isbn,
                    publication_year=publication_year if isinstance(publication_year, int) else None,
                    cover_url=cover_url,
                    thumbnail_url=thumbnail_url,
                    source="open_library",
                    external_id=self._external_id(doc.get("key"), cover_key),
                )
            )

            if len(candidates) >= limit:
                break

        return candidates

    def _first_author(self, author_names: object) -> str | None:
        if not isinstance(author_names, list) or not author_names:
            return None
        first_author = author_names[0]
        return first_author if isinstance(first_author, str) else None

    def _first_isbn(self, isbns: object) -> str | None:
        if not isinstance(isbns, list) or not isbns:
            return None
        first_isbn = isbns[0]
        return self._clean_isbn(first_isbn) if isinstance(first_isbn, str) else None

    def _clean_isbn(self, isbn: str | None) -> str | None:
        if not isbn:
            return None

        clean_isbn = "".join(character for character in isbn.upper() if character.isdigit() or character == "X")
        return clean_isbn or None

    def _cover_url(self, cover_id: object, isbn: str | None, size: str) -> str:
        if isinstance(cover_id, int):
            return OPEN_LIBRARY_COVERS_URL.format(cover_id=cover_id, size=size)
        return OPEN_LIBRARY_ISBN_COVERS_URL.format(isbn=isbn, size=size)

    def _external_id(self, key: object, fallback: str) -> str:
        return key if isinstance(key, str) else fallback
