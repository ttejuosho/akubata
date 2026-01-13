from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ConversationParticipant(Base):
    __tablename__ = "conversationParticipants"

    participant_id: Mapped[str] = mapped_column(
        "participantId",
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

    userId: Mapped[str] = mapped_column(
        "userId",
        CHAR(36),
        ForeignKey("users.userId", ondelete="CASCADE"),
        nullable=False,
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
    conversation: Mapped["Conversation"] = relationship(back_populates="participants")
    user: Mapped["User"] = relationship(back_populates="conversation_participants")

    # Recommended constraint: prevent duplicate membership rows
    __table_args__ = (
        UniqueConstraint("conversationId", "userId", name="uq_conversation_participants_conversation_user"),
    )
