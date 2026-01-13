from __future__ import annotations

import enum
from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Text, func
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class NotificationType(str, enum.Enum):
    message = "message"
    system = "system"


class Notification(Base):
    __tablename__ = "notifications"

    notification_id: Mapped[str] = mapped_column(
        "notificationId",
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    recipient_id: Mapped[str] = mapped_column(
        "recipientId",
        CHAR(36),
        ForeignKey("users.userId", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    type: Mapped[NotificationType] = mapped_column(
        "type",
        Enum(NotificationType),
        nullable=False,
        default=NotificationType.message,
    )

    notification_content: Mapped[str] = mapped_column("notificationContent", Text, nullable=False)

    is_read: Mapped[bool] = mapped_column("isRead", Boolean, nullable=False, default=False)

    related_conversation_id: Mapped[Optional[str]] = mapped_column(
        "relatedConversationId",
        CHAR(36),
        ForeignKey("conversations.conversationId", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    related_message_id: Mapped[Optional[str]] = mapped_column(
        "relatedMessageId",
        CHAR(36),
        ForeignKey("messages.messageId", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

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
    recipient: Mapped["User"] = relationship(back_populates="notifications")

    conversation: Mapped["Conversation | None"] = relationship(back_populates="notifications")
    message: Mapped["Message | None"] = relationship(back_populates="notifications")
