from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    product_id: Mapped[str] = mapped_column(
        "productId",
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    product_name: Mapped[str] = mapped_column("productName", String(255), nullable=False)
    category: Mapped[str | None] = mapped_column("category", String(255), nullable=True)
    description: Mapped[str | None] = mapped_column("description", Text, nullable=True)

    unit_price: Mapped[float] = mapped_column("unitPrice", Numeric(10, 2), nullable=False)

    stock_quantity: Mapped[int] = mapped_column("stockQuantity", Integer, nullable=False, default=0)

    image_url: Mapped[str | None] = mapped_column("imageUrl", String(2048), nullable=True)

    supplier_id: Mapped[str | None] = mapped_column(
        "supplierId",
        CHAR(36),
        ForeignKey("suppliers.supplierId", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column("isActive", Boolean, nullable=False, default=True)

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
    supplier: Mapped["Supplier | None"] = relationship(back_populates="products")

    order_items: Mapped[list["OrderItem"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
    )
