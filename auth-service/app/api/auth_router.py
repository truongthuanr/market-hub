from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.services.auth_service import AuthService
from app.schemas.user_schema import UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.register_user(user_in)


@router.post("/login", response_model=UserOut)
def login(user_in: UserLogin, request: Request, db: Session = Depends(get_db)):
    service = AuthService(db)
    user = service.authenticate_user(user_in.email, user_in.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    request.session["user_id"] = user.id
    request.session["email"] = user.email
    request.session["role"] = user.role
    return user


@router.post("/logout")
def logout(request: Request):
    request.session.clear()
    return {"detail": "Logged out"}


@router.get("/me", response_model=UserOut)
def me(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    service = AuthService(db)
    user = service.get_user_by_id(user_id)
    if not user:
        request.session.clear()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user
