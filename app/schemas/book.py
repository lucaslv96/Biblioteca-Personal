from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BookBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    author: str | None = Field(default=None, max_length=150)
    description: str | None = Field(default=None, max_length=1000)
    publication_year: int | None = Field(default=None, ge=0, le=3000)
    is_read: bool = False


class BookCreate(BookBase):
    pass


class BookUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    author: str | None = Field(default=None, max_length=150)
    description: str | None = Field(default=None, max_length=1000)
    publication_year: int | None = Field(default=None, ge=0, le=3000)
    is_read: bool | None = None


class BookRead(BookBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
