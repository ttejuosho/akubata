from __future__ import annotations

import enum
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class PaymentMethod(str, enum.Enum):
    credit_card = "credit card"
    paypal = "paypal"
    bank_transfer = "bank transfer"
    check = "check"
    cryptocurrency = "cryptocurrency"
    apple_pay = "apple pay"
    google_pay = "google pay"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"


class OrderPayment(Base):
    __tablename__ = "orderPayments"

    order_payment_id: Mapped[str] = mapped_column(
        "orderPaymentId",
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
        unique=True,  # important for 1:1 (also commonly present in DB schema)
    )

    payment_method: Mapped[PaymentMethod] = mapped_column(
        "paymentMethod",
        Enum(PaymentMethod),
        nullable=False,
    )

    card_brand: Mapped[str | None] = mapped_column("cardBrand", String(255), nullable=True)
    card_last4: Mapped[str | None] = mapped_column("cardLast4", String(4), nullable=True)

    transaction_id: Mapped[str | None] = mapped_column("transactionId", String(255), nullable=True)

    payment_status: Mapped[PaymentStatus] = mapped_column(
        "paymentStatus",
        Enum(PaymentStatus),
        nullable=False,
        default=PaymentStatus.pending,
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

    # Relationship back to Order (1:1)
    order: Mapped["Order"] = relationship(back_populates="payment")
