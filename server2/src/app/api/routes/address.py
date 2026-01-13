from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.address import Address
from app.schemas.address import (
    AddressCreate,
    AddressUpdate,
    AddressResponse,
    AddressMessageResponse,
)
from app.services.address_service import (
    get_addresses,
    get_address_by_id,
    create_address,
    update_address,
    delete_address,
    set_default_address,
    get_default_address,
)

router = APIRouter(
    prefix="/addresses",
    tags=["addresses"],
)

@router.get(
    "/",
    response_model=List[AddressResponse],
)
def list_addresses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_addresses(db, user=current_user)

@router.get(
    "/default",
    response_model=AddressMessageResponse,
)
def fetch_default_address(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    address = get_default_address(db, user=current_user)

    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No default address set",
        )

    return {
        "message": "success",
        "address": address,
    }

@router.get(
    "/{address_id}",
    response_model=AddressMessageResponse,
)
def fetch_address_by_id(
    address_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    address = get_address_by_id(
        db,
        address_id=address_id,
        user=current_user,
    )

    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )

    return {
        "message": "success",
        "address": address,
    }

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=AddressMessageResponse,
)
def create_new_address(
    address_in: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        address = create_address(
            db,
            user=current_user,
            address_in=address_in,
        )
    except ValueError as exc:
        if str(exc) == "DUPLICATE_ADDRESS":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This address already exists",
            )
        raise

    return {
        "message": "Address created successfully",
        "address": address,
    }

@router.put(
    "/{address_id}",
    response_model=AddressResponse,
)
def update_existing_address(
    address_id: str,
    address_in: AddressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    address = get_address_by_id(
        db,
        address_id=address_id,
        user=current_user,
    )

    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )

    return update_address(
        db,
        address=address,
        address_in=address_in,
    )

@router.delete(
    "/{address_id}",
)
def remove_address(
    address_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    address = get_address_by_id(
        db,
        address_id=address_id,
        user=current_user,
    )

    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )

    delete_address(db, address=address)

    return {"message": "Deleted"}

@router.patch(
    "/{address_id}/default",
)
def make_address_default(
    address_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        set_default_address(
            db,
            address_id=address_id,
            user=current_user,
        )
    except ValueError as exc:
        if str(exc) == "ADDRESS_NOT_FOUND":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found",
            )
        raise

    return {
        "message": "Default address updated successfully",
    }

