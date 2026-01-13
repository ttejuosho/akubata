from __future__ import annotations

import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, func
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class OrderStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    cancelled = "cancelled"
    open = "open"
    closed = "closed"


class PaymentMethod(str, enum.Enum):
    credit_card = "credit card"
    check = "check"
    bank_transfer = "bank transfer"
    cryptocurrency = "cryptocurrency"


class Order(Base):
    __tablename__ = "orders"

    order_id: Mapped[str] = mapped_column(
        "orderId",
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    userId: Mapped[str] = mapped_column(
        "userId",
        CHAR(36),
        ForeignKey("users.userId", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    order_date: Mapped[datetime] = mapped_column(
        "orderDate",
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    order_status: Mapped[OrderStatus] = mapped_column(
        "orderStatus",
        Enum(OrderStatus),
        nullable=False,
        default=OrderStatus.pending,
    )

    payment_method: Mapped[PaymentMethod] = mapped_column(
        "paymentMethod",
        Enum(PaymentMethod),
        nullable=False,
        default=PaymentMethod.credit_card,
    )

    total_amount: Mapped[float] = mapped_column(
        "totalAmount",
        Numeric(10, 2),
        nullable=False,
        default=0.0,
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

    # Relationships
    user: Mapped["User"] = relationship(back_populates="orders")

    order_items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
    )

    addresses: Mapped[list["OrderAddress"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
    )

    payment: Mapped["OrderPayment | None"] = relationship(
        back_populates="order",
        uselist=False,
        cascade="all, delete-orphan",
    )
