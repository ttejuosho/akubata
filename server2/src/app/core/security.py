from __future__ import annotations
import re
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)

def _parse_expires_in(expires_in: str) -> timedelta:
    """
    Supports values like '1d', '7d', '30m', '12h' to mirror Node config.
    Defaults to 1 day if unparseable.
    """
    m = re.fullmatch(r"(\d+)\s*([mhd])", expires_in.strip().lower())
    if not m:
        return timedelta(days=1)
    amount = int(m.group(1))
    unit = m.group(2)
    if unit == "m":
        return timedelta(minutes=amount)
    if unit == "h":
        return timedelta(hours=amount)
    return timedelta(days=amount)

def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.access_token_expire_minutes)

    payload: dict[str, Any] = {"sub": subject, "iat": int(now.timestamp()), "exp": int(expire.timestamp())}
    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

def decode_and_verify_token(token: str) -> dict:
    """
    Verifies signature + exp automatically.
    Raises jose.JWTError for invalid tokens.
    """
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
