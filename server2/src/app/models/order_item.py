from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, func
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class OrderItem(Base):
    __tablename__ = "orderItems"

    order_item_id: Mapped[str] = mapped_column(
        "orderItemId",
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

    product_id: Mapped[str] = mapped_column(
        "productId",
        CHAR(36),
        ForeignKey("products.productId", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    quantity: Mapped[int] = mapped_column("quantity", Integer, nullable=False, default=1)

    # DECIMAL(10,2). SQLAlchemy typically returns Decimal; keep Numeric for correctness.
    price: Mapped[float] = mapped_column("price", Numeric(10, 2), nullable=False)

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
    order: Mapped["Order"] = relationship(back_populates="order_items")
    product: Mapped["Product"] = relationship(back_populates="order_items")
