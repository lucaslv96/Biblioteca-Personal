from sqlalchemy.exc import IntegrityError

from app.core.security import get_password_hash
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate


class UserAlreadyExistsError(Exception):
    pass


class UserService:
    def __init__(self, user_repository: UserRepository) -> None:
        self.user_repository = user_repository

    def create_user(self, user_data: UserCreate) -> User:
        email = str(user_data.email).lower()

        if self.user_repository.get_by_email(email):
            raise UserAlreadyExistsError("A user with this email already exists.")

        user = User(
            email=email,
            full_name=user_data.full_name,
            hashed_password=get_password_hash(user_data.password),
        )
        try:
            return self.user_repository.create(user)
        except IntegrityError as exc:
            raise UserAlreadyExistsError("A user with this email already exists.") from exc
