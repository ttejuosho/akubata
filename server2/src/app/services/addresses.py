from sqlalchemy import update
from sqlalchemy.orm import Session

from app.models.address import Address


def unset_other_defaults(db: Session, user_id: str, exclude_address_id: str | None = None) -> None:
    stmt = (
        update(Address)
        .where(Address.user_id == user_id)
        .where(Address.is_default.is_(True))
    )
    if exclude_address_id:
        stmt = stmt.where(Address.address_id != exclude_address_id)

    db.execute(stmt)


def create_address(db: Session, *, address: Address) -> Address:
    # If this new address is default, unset any other defaults for the same user
    if address.is_default:
        unset_other_defaults(db, user_id=address.user_id)

    db.add(address)
    db.commit()
    db.refresh(address)
    return address


def update_address(db: Session, *, address: Address, updates: dict) -> Address:
    # Apply updates
    for k, v in updates.items():
        setattr(address, k, v)

    # If it’s being set to default, unset other defaults
    if "is_default" in updates and bool(updates["is_default"]) is True:
        unset_other_defaults(db, user_id=address.user_id, exclude_address_id=address.address_id)

    db.commit()
    db.refresh(address)
    return address
