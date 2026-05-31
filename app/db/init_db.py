from sqlalchemy import inspect, text

from app import models  # noqa: F401
from app.db.base import Base
from app.db.session import engine


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_book_cover_columns()


def ensure_book_cover_columns() -> None:
    inspector = inspect(engine)
    if "books" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("books")}
    cover_columns = {
        "isbn": "VARCHAR(20)",
        "cover_url": "VARCHAR(500)",
        "cover_source": "VARCHAR(50)",
        "external_id": "VARCHAR(100)",
    }

    missing_columns = {
        name: definition
        for name, definition in cover_columns.items()
        if name not in existing_columns
    }
    if not missing_columns:
        return

    with engine.begin() as connection:
        for name, definition in missing_columns.items():
            connection.execute(text(f"ALTER TABLE books ADD COLUMN {name} {definition}"))
