from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.address import Address
from app.models.user import User

def unset_other_defaults(db: Session, userId: str, exclude_address_id: str | None = None) -> None:
    stmt = (
        update(Address)
        .where(Address.userId == userId)
        .where(Address.is_default.is_(True))
    )
    if exclude_address_id:
        stmt = stmt.where(Address.address_id != exclude_address_id)

    db.execute(stmt)

def create_address(db: Session, *, address: Address) -> Address:
    # If this new address is default, unset any other defaults for the same user
    if address.is_default:
        unset_other_defaults(db, userId=address.userId)

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
        unset_other_defaults(db, userId=address.userId, exclude_address_id=address.address_id)

    db.commit()
    db.refresh(address)
    return address

def get_addresses(db: Session, *, user: User) -> List[Address]:
    return (
        db.query(Address)
        .filter(Address.user_id == user.user_id)
        .all()
    )


def get_address_by_id(
    db: Session,
    *,
    address_id: str,
    user: User,
) -> Optional[Address]:
    return (
        db.query(Address)
        .filter(
            Address.address_id == address_id,
            Address.user_id == user.user_id,
        )
        .first()
    )


def find_duplicate_address(
    db: Session,
    *,
    user: User,
    address: Address,
) -> Optional[Address]:
    return (
        db.query(Address)
        .filter(
            Address.user_id == user.user_id,
            Address.address_line1 == address.address_line1,
            Address.city == address.city,
            Address.state == address.state,
            Address.zip_code == address.zip_code,
            Address.country == address.country,
        )
        .first()
    )


def create_address(
    db: Session,
    *,
    user: User,
    address_in,
) -> Address:
    address = Address(
        **address_in.model_dump(),
        user_id=user.user_id,
    )

    duplicate = find_duplicate_address(db, user=user, address=address)
    if duplicate:
        raise ValueError("DUPLICATE_ADDRESS")

    db.add(address)
    db.commit()
    db.refresh(address)
    return address


def update_address(
    db: Session,
    *,
    address: Address,
    address_in,
) -> Address:
    update_data = address_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(address, field, value)

    db.commit()
    db.refresh(address)
    return address


def delete_address(
    db: Session,
    *,
    address: Address,
) -> None:
    db.delete(address)
    db.commit()


def set_default_address(
    db: Session,
    *,
    address_id: str,
    user: User,
) -> None:
    with db.begin():
        address = (
            db.query(Address)
            .filter(
                Address.address_id == address_id,
                Address.user_id == user.user_id,
            )
            .first()
        )

        if not address:
            raise ValueError("ADDRESS_NOT_FOUND")

        # Clear all existing defaults
        (
            db.query(Address)
            .filter(Address.user_id == user.user_id)
            .update({Address.is_default: False})
        )

        # Set new default
        address.is_default = True


def get_default_address(
    db: Session,
    *,
    user: User,
) -> Optional[Address]:
    return (
        db.query(Address)
        .filter(
            Address.user_id == user.user_id,
            Address.is_default.is_(True),
        )
        .first()
    )


