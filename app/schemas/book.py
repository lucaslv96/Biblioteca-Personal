from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BookBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    author: str | None = Field(default=None, max_length=150)
    isbn: str | None = Field(default=None, max_length=20)
    description: str | None = Field(default=None, max_length=1000)
    publication_year: int | None = Field(default=None, ge=0, le=3000)
    cover_url: str | None = Field(default=None, max_length=500)
    cover_source: str | None = Field(default=None, max_length=50)
    external_id: str | None = Field(default=None, max_length=100)
    is_read: bool = False


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    author: str | None = Field(default=None, max_length=150)
    isbn: str | None = Field(default=None, max_length=20)
    description: str | None = Field(default=None, max_length=1000)
    publication_year: int | None = Field(default=None, ge=0, le=3000)
    cover_url: str | None = Field(default=None, max_length=500)
    cover_source: str | None = Field(default=None, max_length=50)
    external_id: str | None = Field(default=None, max_length=100)
    is_read: bool | None = None


class BookRead(BookBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookCoverCandidate(BaseModel):
    title: str
    author: str | None = None
    isbn: str | None = None
    publication_year: int | None = None
    cover_url: str
    thumbnail_url: str
    source: str
    external_id: str
