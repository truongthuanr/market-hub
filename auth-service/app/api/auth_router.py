from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.db.session import SessionLocal
from app.services.auth_service import AuthService
from app.schemas.user_schema import Token, UserCreate, UserLogin, UserOut

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


@router.post("/login", response_model=Token)
def login(user_in: UserLogin, response: Response, db: Session = Depends(get_db)):
    service = AuthService(db)
    user = service.authenticate_user(user_in.email, user_in.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token, refresh_token = service.create_tokens(user)
    response.set_cookie(
        key=settings.access_token_cookie_name,
        value=token.access_token,
        httponly=True,
        samesite=settings.access_token_cookie_same_site,
        secure=settings.access_token_cookie_secure,
        path="/",
        max_age=settings.access_token_expires_minutes * 60,
    )
    response.set_cookie(
        key=settings.refresh_token_cookie_name,
        value=refresh_token,
        httponly=True,
        samesite=settings.refresh_token_cookie_same_site,
        secure=settings.refresh_token_cookie_secure,
        path="/",
        max_age=settings.refresh_token_expires_days * 24 * 60 * 60,
    )
    return token


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=settings.access_token_cookie_name, path="/")
    response.delete_cookie(key=settings.refresh_token_cookie_name, path="/")
    return {"detail": "Logged out"}


def get_current_user(db: Session = Depends(get_db), request: Request = None) -> UserOut:
    if request is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = request.cookies.get(settings.access_token_cookie_name)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user_id = security.decode_access_token(token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        user_id_int = int(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    service = AuthService(db)
    user = service.get_user_by_id(user_id_int)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user


@router.get("/me", response_model=UserOut)
def me(current_user: UserOut = Depends(get_current_user)):
    return current_user


@router.post("/refresh", response_model=Token)
def refresh(response: Response, request: Request, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get(settings.refresh_token_cookie_name)
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user_id = security.decode_refresh_token(refresh_token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        user_id_int = int(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    service = AuthService(db)
    user = service.get_user_by_id(user_id_int)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token, new_refresh = service.create_tokens(user)
    response.set_cookie(
        key=settings.access_token_cookie_name,
        value=token.access_token,
        httponly=True,
        samesite=settings.access_token_cookie_same_site,
        secure=settings.access_token_cookie_secure,
        path="/",
        max_age=settings.access_token_expires_minutes * 60,
    )
    response.set_cookie(
        key=settings.refresh_token_cookie_name,
        value=new_refresh,
        httponly=True,
        samesite=settings.refresh_token_cookie_same_site,
        secure=settings.refresh_token_cookie_secure,
        path="/",
        max_age=settings.refresh_token_expires_days * 24 * 60 * 60,
    )
    return token
