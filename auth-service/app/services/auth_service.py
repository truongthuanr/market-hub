from typing import Optional

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core import security
from app.repositories.user_repo import UserRepository
from app.schemas.user_schema import UserCreate, UserOut, Token


class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def register_user(self, user_in: UserCreate) -> UserOut:
        existing = self.user_repo.get_by_email(user_in.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        user = self.user_repo.create(user_in)
        return UserOut.model_validate(user)

    def authenticate_user(self, email: str, password: str) -> Optional[UserOut]:
        user = self.user_repo.get_by_email(email)
        if not user:
            return None
        if not security.verify_password(password, user.hashed_password):
            return None
        return UserOut.model_validate(user)

    def create_token(self, user: UserOut) -> Token:
        access_token = security.create_access_token(subject=str(user.id))
        return Token(access_token=access_token)
