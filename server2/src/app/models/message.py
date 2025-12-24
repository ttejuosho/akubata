from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Message(Base):
    __tablename__ = "messages"

    message_id: Mapped[str] = mapped_column(
        "messageId",
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    conversation_id: Mapped[str] = mapped_column(
        "conversationId",
        CHAR(36),
        ForeignKey("conversations.conversationId", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    sender_id: Mapped[str] = mapped_column(
        "senderId",
        CHAR(36),
        ForeignKey("users.userId", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    message_content: Mapped[str] = mapped_column("messageContent", Text, nullable=False)

    is_read: Mapped[bool] = mapped_column("isRead", Boolean, nullable=False, default=False)

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
    conversation: Mapped["Conversation"] = relationship(back_populates="messages")
    sender: Mapped["User"] = relationship(back_populates="sent_messages")

    # When we implement Notification, you'll likely want:
    # notifications: Mapped[list["Notification"]] = relationship(
    #     back_populates="message",
    #     passive_deletes=True,  # rely on DB ON DELETE SET NULL if present
    # )
