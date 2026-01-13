from __future__ import annotations
from typing import Optional

import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import String, Boolean, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.mysql import CHAR

from app.db.base import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    staff = "staff"
    basic = "basic"


class User(Base):
    __tablename__ = "users"

    # Sequelize UUID primary key: DataTypes.UUID + UUIDV4
    # In MySQL this is commonly stored as CHAR(36)
    userId: Mapped[str] = mapped_column(
        "userId",
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    first_name: Mapped[str] = mapped_column("firstName", String(255), nullable=False)
    last_name: Mapped[str] = mapped_column("lastName", String(255), nullable=False)

    email_address: Mapped[str] = mapped_column(
        "emailAddress",
        String(255),
        nullable=False,
        unique=True,
        index=True,
    )

    phone_number: Mapped[Optional[str]] = mapped_column(
        "phoneNumber",
        String(50),
        nullable=True,
        unique=True,
    )

    # Sequelize "password" is hashed via hook; keep hashed_password naming in Python,
    # but map to the existing column name "password".
    hashed_password: Mapped[str] = mapped_column("password", String(255), nullable=False)

    role: Mapped[UserRole] = mapped_column(
        "role",
        Enum(UserRole),
        nullable=False,
        default=UserRole.basic,
    )

    password_reset_token: Mapped[Optional[str]] = mapped_column(
        "passwordResetToken",
        String(255),
        nullable=True,
    )

    token_expires: Mapped[Optional[datetime]] = mapped_column(
        "tokenExpires",
        DateTime,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column("isActive", Boolean, nullable=False, default=True)

    # Sequelize timestamps: createdAt / updatedAt
    created_at: Mapped[datetime] = mapped_column(
        "createdAt",
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updatedAt",
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships (see next section for matching models)
    addresses: Mapped[list["Address"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    orders: Mapped[list["Order"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    sent_messages: Mapped[list["Message"]] = relationship(back_populates="sender", cascade="all, delete-orphan")
    conversation_participants: Mapped[list["ConversationParticipant"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    notifications: Mapped[list["Notification"]] = relationship(back_populates="recipient", cascade="all, delete-orphan")
