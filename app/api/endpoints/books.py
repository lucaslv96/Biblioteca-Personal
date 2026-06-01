from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.book_repository import BookRepository
from app.schemas.book import BookCoverCandidate, BookCreate, BookRead, BookUpdate
from app.services.book_cover_service import BookCoverSearchError, BookCoverSearchService
from app.services.book_service import BookNotFoundError, BookService

router = APIRouter(prefix="/books", tags=["Books"])


def get_book_service(db: Session = Depends(get_db)) -> BookService:
    return BookService(BookRepository(db))


def get_book_cover_search_service() -> BookCoverSearchService:
    return BookCoverSearchService()


@router.get("", response_model=list[BookRead], summary="List current user's books")
def list_books(
    current_user: User = Depends(get_current_user),
    book_service: BookService = Depends(get_book_service),
) -> list[BookRead]:
    return book_service.list_books(current_user)


@router.post(
    "",
    response_model=BookRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a book",
)
def create_book(
    book_data: BookCreate,
    current_user: User = Depends(get_current_user),
    book_service: BookService = Depends(get_book_service),
) -> BookRead:
    return book_service.create_book(book_data, current_user)


@router.get(
    "/covers/search",
    response_model=list[BookCoverCandidate],
    summary="Search cover candidates by title or ISBN",
)
async def search_book_covers(
    title: str | None = Query(default=None, min_length=2, max_length=200),
    author: str | None = Query(default=None, max_length=150),
    isbn: str | None = Query(default=None, min_length=10, max_length=20),
    limit: int = Query(default=8, ge=1, le=12),
    _current_user: User = Depends(get_current_user),
    cover_search_service: BookCoverSearchService = Depends(get_book_cover_search_service),
) -> list[BookCoverCandidate]:
    if not title and not isbn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide a title or ISBN to search covers.",
        )

    try:
        return await cover_search_service.search(title=title, author=author, isbn=isbn, limit=limit)
    except BookCoverSearchError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Cover search is temporarily unavailable.",
        ) from exc


@router.patch("/{book_id}", response_model=BookRead, summary="Update a book")
def update_book(
    book_id: int,
    book_data: BookUpdate,
    current_user: User = Depends(get_current_user),
    book_service: BookService = Depends(get_book_service),
) -> BookRead:
    try:
        return book_service.update_book(book_id, book_data, current_user)
    except BookNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found.") from exc


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a book")
def delete_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    book_service: BookService = Depends(get_book_service),
) -> Response:
    try:
        book_service.delete_book(book_id, current_user)
    except BookNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found.") from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
