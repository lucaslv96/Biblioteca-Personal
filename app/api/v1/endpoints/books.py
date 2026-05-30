from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.book_repository import BookRepository
from app.schemas.book import BookCreate, BookRead, BookUpdate
from app.services.book_service import BookNotFoundError, BookService

router = APIRouter(prefix="/books", tags=["Books"])


def get_book_service(db: Session = Depends(get_db)) -> BookService:
    return BookService(BookRepository(db))


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
