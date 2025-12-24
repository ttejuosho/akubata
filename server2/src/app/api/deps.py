from __future__ import annotations
from typing import Annotated, Callable

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_and_verify_token
from app.db.session import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


DbDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(oauth2_scheme)]


DbDep = Annotated[Session, Depends(get_db)]


def _get_token_from_request(request: Request) -> str | None:
    # header > cookie (same as your getCurrentUser)
    auth = request.headers.get("authorization")
    if auth and auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip()

    token = request.cookies.get(settings.cookie_name)
    return token


def get_current_user(request: Request, db: DbDep) -> User:
    token = _get_token_from_request(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authorized, no token")

    try:
        payload = decode_and_verify_token(token)
    except JWTError:
        # covers malformed token, expired token, invalid signature
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("userId")
    if not user_id:
        raise HTTPException(status_code=401, detail="Malformed token")

    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]


def authorize(*roles: str) -> Callable:
    def _dep(current_user: CurrentUserDep) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Insufficient permissions",
            )
        return current_user

    return _dep