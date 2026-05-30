from app.models.book import Book
from app.models.user import User
from app.repositories.book_repository import BookRepository
from app.schemas.book import BookCreate, BookUpdate


class BookNotFoundError(Exception):
    pass


class BookService:
    def __init__(self, book_repository: BookRepository) -> None:
        self.book_repository = book_repository

    def list_books(self, current_user: User) -> list[Book]:
        return self.book_repository.list_by_owner(current_user.id)

    def create_book(self, book_data: BookCreate, current_user: User) -> Book:
        book = Book(**book_data.model_dump(), owner_id=current_user.id)
        return self.book_repository.create(book)

    def update_book(self, book_id: int, book_data: BookUpdate, current_user: User) -> Book:
        book = self.book_repository.get_by_id_and_owner(book_id, current_user.id)
        if not book:
            raise BookNotFoundError("Book not found.")

        values = book_data.model_dump(exclude_unset=True)
        return self.book_repository.update(book, values)

    def delete_book(self, book_id: int, current_user: User) -> None:
        book = self.book_repository.get_by_id_and_owner(book_id, current_user.id)
        if not book:
            raise BookNotFoundError("Book not found.")

        self.book_repository.delete(book)
