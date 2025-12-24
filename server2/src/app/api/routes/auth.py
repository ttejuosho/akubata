from __future__ import annotations

from datetime import datetime, timezone, timedelta
import secrets

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.models.address import Address
from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    InAppPasswordResetRequest,
)
from app.schemas.user import UserPublic
from app.api.deps import CurrentUserDep, get_current_user
from app.services.mailer import send_email  # you will implement this


router = APIRouter(prefix="/auth", tags=["auth"])


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=7 * 24 * 60 * 60,  # 7 days (matches Node)
    )


def _clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.cookie_name,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )


@router.get("/me", response_model=UserPublic)
def me(current_user: CurrentUserDep) -> User:
    return current_user


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, response: Response, db: Session = Depends(get_db)) -> dict:
    normalized_email = payload.emailAddress.strip().lower()

    if payload.password != payload.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    existing = db.query(User).filter(User.email_address == normalized_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    user = User(
        first_name=payload.firstName,
        last_name=payload.lastName,
        email_address=normalized_email,
        phone_number=payload.phoneNumber,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user_id=user.user_id, email_address=user.email_address, role=user.role)
    _set_auth_cookie(response, token)

    # Welcome email (parity with Node)
    try:
        awaitable = send_email(  # allow either sync or async implementation
            template="welcome",
            context={"firstName": user.first_name, "loginLink": "http://localhost:5173/login"},
            subject="Akubata Stores - Welcome!",
            to_email=normalized_email,
        )
        # If send_email is async, it returns a coroutine; ignore if sync.
        if hasattr(awaitable, "__await__"):
            import asyncio
            asyncio.create_task(awaitable)
    except Exception:
        # do not fail signup on email
        pass

    return {
        "message": "Welcome! Signup successful.",
        "user": {
            "userId": user.user_id,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "emailAddress": user.email_address,
            "phoneNumber": user.phone_number,
            "role": user.role,
        },
    }


@router.post("/login")
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> dict:
    normalized_email = payload.emailAddress.strip().lower()

    # Load user + default address (like your Sequelize include)
    user = (
        db.query(User)
        .options(joinedload(User.addresses))
        .filter(User.email_address == normalized_email)
        .first()
    )

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token(user_id=user.user_id, email_address=user.email_address, role=user.role)
    _set_auth_cookie(response, token)

    default_address = next((a for a in user.addresses if a.is_default), None)

    def format_address(a: Address | None) -> str | None:
        if not a:
            return None
        parts = [a.address_line1, a.address_line2, a.city, a.state, a.zip_code, a.country]
        return ", ".join([p for p in parts if p])

    return {
        "message": "Logged in successfully",
        "user": {
            "userId": user.user_id,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "emailAddress": user.email_address,
            "phoneNumber": user.phone_number,
            "role": user.role,
            "address": format_address(default_address),
        },
    }


@router.post("/logout")
def logout(response: Response) -> dict:
    _clear_auth_cookie(response)
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> dict:
    normalized_email = payload.emailAddress.strip().lower()
    user = db.query(User).filter(User.email_address == normalized_email).first()
    if not user:
        raise HTTPException(status_code=400, detail="No user with that email")

    reset_token = secrets.token_hex(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    user.password_reset_token = reset_token
    user.token_expires = expires_at
    db.commit()

    # Email reset link
    try:
        link = f"http://localhost:5173/reset-password/{reset_token}"
        awaitable = send_email(
            template="forgot",
            context={"firstName": user.first_name, "passwordResetLink": link},
            subject="Akubata Stores - Lets Reset Your Password",
            to_email=normalized_email,
        )
        if hasattr(awaitable, "__await__"):
            import asyncio
            asyncio.create_task(awaitable)
    except Exception:
        pass

    return {"message": "Password reset email sent."}


@router.post("/reset-password/{token}")
def reset_password(token: str, payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> dict:
    if payload.newPassword != payload.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    now = datetime.now(timezone.utc)

    user = (
        db.query(User)
        .filter(User.password_reset_token == token)
        .filter(User.token_expires.isnot(None))
        .filter(User.token_expires > now)
        .first()
    )
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user.hashed_password = hash_password(payload.newPassword)
    user.password_reset_token = None
    user.token_expires = None
    db.commit()

    # Confirmation email
    try:
        awaitable = send_email(
            template="passwordReset",
            context={},
            subject="Akubata Stores - Password Reset Confirmation",
            to_email=user.email_address,
        )
        if hasattr(awaitable, "__await__"):
            import asyncio
            asyncio.create_task(awaitable)
    except Exception:
        pass

    return {"message": "Password reset successful"}


@router.post("/password-reset")
def in_app_password_reset(
    payload: InAppPasswordResetRequest,
    current_user: CurrentUserDep,
    db: Session = Depends(get_db),
) -> dict:
    if not payload.newPassword or not payload.confirmNewPassword:
        raise HTTPException(status_code=400, detail="All fields are required")
    if payload.newPassword != payload.confirmNewPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # Update password
    current_user.hashed_password = hash_password(payload.newPassword)
    current_user.password_reset_token = None
    current_user.token_expires = None
    db.commit()

    return {"message": "Password updated successfully"}


@router.post("/verify-email/{token}")
def verify_email(token: str, db: Session = Depends(get_db)) -> dict:
    if not token:
        raise HTTPException(status_code=400, detail="Verification token is required")

    now = datetime.now(timezone.utc)
    user = (
        db.query(User)
        .filter(User.password_reset_token == token)
        .filter(User.token_expires.isnot(None))
        .filter(User.token_expires > now)
        .first()
    )
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    user.is_active = True
    user.password_reset_token = None
    user.token_expires = None
    db.commit()

    return {"message": "Email verified successfully"}


@router.put("/")
def update_user(
    payload: dict,
    current_user: CurrentUserDep,
    db: Session = Depends(get_db),
) -> dict:
    # Mirror your Node behavior: allow only a few fields
    first = payload.get("firstName")
    last = payload.get("lastName")
    phone = payload.get("phoneNumber")

    if first is not None:
        current_user.first_name = first
    if last is not None:
        current_user.last_name = last
    if phone is not None:
        current_user.phone_number = phone

    db.commit()
    db.refresh(current_user)

    return {"message": "Profile updated successfully", "user": current_user}
