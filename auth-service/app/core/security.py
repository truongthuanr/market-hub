from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def _create_token(
    subject: str,
    token_type: str,
    role: Optional[str],
    expires: datetime,
    issued_at: datetime,
) -> str:
    to_encode = {
        "sub": subject,
        "exp": expires,
        "iat": issued_at,
        "nbf": issued_at,
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "typ": token_type,
    }
    if role:
        to_encode["role"] = role
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def create_access_token(
    subject: str, role: Optional[str] = None, expires_minutes: Optional[int] = None
) -> str:
    expire_minutes = expires_minutes or settings.access_token_expires_minutes
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=expire_minutes)
    return _create_token(subject, "access", role, expire, now)


def create_refresh_token(
    subject: str, role: Optional[str] = None, expires_days: Optional[int] = None
) -> str:
    expire_days = expires_days or settings.refresh_token_expires_days
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=expire_days)
    return _create_token(subject, "refresh", role, expire, now)


def decode_access_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
            issuer=settings.jwt_issuer,
            audience=settings.jwt_audience,
            options={"require": ["exp", "iss", "aud", "sub", "typ"]},
            leeway=settings.jwt_leeway_seconds,
        )
        if payload.get("typ") != "access":
            return None
        return payload.get("sub")
    except JWTError:
        return None


def decode_refresh_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
            issuer=settings.jwt_issuer,
            audience=settings.jwt_audience,
            options={"require": ["exp", "iss", "aud", "sub", "typ"]},
            leeway=settings.jwt_leeway_seconds,
        )
        if payload.get("typ") != "refresh":
            return None
        return payload.get("sub")
    except JWTError:
        return None
