from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, TokenResponse


class InvalidCredentialsError(Exception):
    pass


class AuthService:
    def __init__(self, user_repository: UserRepository) -> None:
        self.user_repository = user_repository

    def login(self, credentials: LoginRequest) -> TokenResponse:
        user = self._authenticate_user(credentials)
        access_token = create_access_token(subject=str(user.id))
        return TokenResponse(access_token=access_token, user=user)

    def _authenticate_user(self, credentials: LoginRequest) -> User:
        email = str(credentials.email).lower()
        user = self.user_repository.get_by_email(email)

        if not user or not verify_password(credentials.password, user.hashed_password):
            raise InvalidCredentialsError("Invalid email or password.")

        if not user.is_active:
            raise InvalidCredentialsError("Inactive user.")

        return user
