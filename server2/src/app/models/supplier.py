from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    supplier_id: Mapped[str] = mapped_column(
        "supplierId",
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )

    company_name: Mapped[str] = mapped_column("companyName", String(255), nullable=False)

    contact_name: Mapped[str | None] = mapped_column("contactName", String(255), nullable=True)
    contact_email: Mapped[str | None] = mapped_column("contactEmail", String(255), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column("contactPhone", String(50), nullable=True)

    address: Mapped[str | None] = mapped_column("address", String(255), nullable=True)
    city: Mapped[str | None] = mapped_column("city", String(100), nullable=True)
    state: Mapped[str | None] = mapped_column("state", String(100), nullable=True)
    country: Mapped[str | None] = mapped_column("country", String(100), nullable=True)

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

    # Relationship to Product (supplierId is nullable and SET NULL on delete)
    products: Mapped[list["Product"]] = relationship(
        back_populates="supplier",
        passive_deletes=True,
    )
