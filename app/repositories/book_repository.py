from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.book import Book


class BookRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_by_owner(self, owner_id: int) -> list[Book]:
        statement = select(Book).where(Book.owner_id == owner_id).order_by(Book.created_at.desc())
        return list(self.db.scalars(statement).all())

    def get_by_id_and_owner(self, book_id: int, owner_id: int) -> Book | None:
        statement = select(Book).where(Book.id == book_id, Book.owner_id == owner_id)
        return self.db.scalar(statement)

    def create(self, book: Book) -> Book:
        self.db.add(book)
        self.db.commit()
        self.db.refresh(book)
        return book

    def update(self, book: Book, values: dict[str, object]) -> Book:
        for field, value in values.items():
            setattr(book, field, value)

        self.db.commit()
        self.db.refresh(book)
        return book

    def delete(self, book: Book) -> None:
        self.db.delete(book)
        self.db.commit()
