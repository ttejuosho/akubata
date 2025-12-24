from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, func
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Conversation(Base):
    __tablename__ = "conversations"

    conversation_id: Mapped[str] = mapped_column(
        "conversationId",
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    is_group: Mapped[bool] = mapped_column("isGroup", Boolean, nullable=False, default=False)

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

    # Relationships (match your Sequelize associations)
    participants: Mapped[list["ConversationParticipant"]] = relationship(
        back_populates="conversation",
        cascade="all, delete-orphan",
    )

    messages: Mapped[list["Message"]] = relationship(
        back_populates="conversation",
        cascade="all, delete-orphan",
    )

    # When we implement Notification, you'll likely want:
    # notifications: Mapped[list["Notification"]] = relationship(
    #     back_populates="conversation",
    #     passive_deletes=True,
    # )
