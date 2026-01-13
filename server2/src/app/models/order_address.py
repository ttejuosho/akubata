from __future__ import annotations

import enum
from datetime import datetime
from uuid import uuid4
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class OrderAddressType(str, enum.Enum):
    shipping = "shipping"
    billing = "billing"


class OrderAddress(Base):
    __tablename__ = "orderAddresses"

    order_address_id: Mapped[str] = mapped_column(
        "orderAddressId",
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    order_id: Mapped[str] = mapped_column(
        "orderId",
        CHAR(36),
        ForeignKey("orders.orderId", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    order_address_type: Mapped[OrderAddressType] = mapped_column(
        "orderAddressType",
        Enum(OrderAddressType),
        nullable=False,
    )

    first_name: Mapped[str] = mapped_column("firstName", String(255), nullable=False)
    last_name: Mapped[Optional[str]] = mapped_column("lastName", String(255), nullable=True)

    phone_number: Mapped[str] = mapped_column("phoneNumber", String(50), nullable=False)

    address_line1: Mapped[str] = mapped_column("addressLine1", String(255), nullable=False)
    address_line2: Mapped[Optional[str]] = mapped_column("addressLine2", String(255), nullable=True)

    city: Mapped[str] = mapped_column("city", String(100), nullable=False)
    state: Mapped[str] = mapped_column("state", String(100), nullable=False)
    zip_code: Mapped[str] = mapped_column("zipCode", String(20), nullable=False)
    country: Mapped[str] = mapped_column("country", String(100), nullable=False)

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

    # Relationship back to Order
    order: Mapped["Order"] = relationship(back_populates="addresses")
