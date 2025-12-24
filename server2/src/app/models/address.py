from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.mysql import CHAR

from app.db.base import Base


class Address(Base):
    __tablename__ = "addresses"

    address_id: Mapped[str] = mapped_column(
        "addressId",
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    user_id: Mapped[str] = mapped_column(
        "userId",
        CHAR(36),
        ForeignKey("users.userId", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    label: Mapped[str | None] = mapped_column("label", String(50), nullable=True)

    recipient_first_name: Mapped[str] = mapped_column("recipientFirstName", String(100), nullable=False)
    recipient_last_name: Mapped[str | None] = mapped_column("recipientLastName", String(100), nullable=True)

    phone_number: Mapped[str] = mapped_column("phoneNumber", String(20), nullable=False)

    address_line1: Mapped[str] = mapped_column("addressLine1", String(255), nullable=False)
    address_line2: Mapped[str | None] = mapped_column("addressLine2", String(255), nullable=True)

    city: Mapped[str] = mapped_column("city", String(100), nullable=False)
    state: Mapped[str] = mapped_column("state", String(100), nullable=False)
    zip_code: Mapped[str] = mapped_column("zipCode", String(20), nullable=False)
    country: Mapped[str] = mapped_column("country", String(100), nullable=False)

    is_default: Mapped[bool] = mapped_column("isDefault", Boolean, nullable=False, default=False)

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

    # Relationship back to User (matches User.addresses in the earlier mapping)
    user: Mapped["User"] = relationship(back_populates="addresses")
