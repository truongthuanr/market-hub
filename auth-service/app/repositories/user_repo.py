from typing import Optional

from sqlalchemy.orm import Session

from app.db.models.user_credential import UserCredential
from app.schemas.user_schema import UserCreate
from app.core.security import hash_password


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> Optional[UserCredential]:
        return self.db.query(UserCredential).filter(UserCredential.email == email).first()

    def get_by_id(self, user_id: int) -> Optional[UserCredential]:
        return self.db.query(UserCredential).filter(UserCredential.id == user_id).first()

    def create(self, user_in: UserCreate) -> UserCredential:
        db_user = UserCredential(
            email=user_in.email,
            hashed_password=hash_password(user_in.password),
            role=user_in.role,
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
