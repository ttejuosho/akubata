from __future__ import annotations

from typing import Optional, List
from datetime import datetime

from pydantic import BaseModel, Field


class AddressBase(BaseModel):
    label: Optional[str] = Field(None, max_length=50)

    recipient_first_name: str = Field(..., max_length=100)
    recipient_last_name: Optional[str] = Field(None, max_length=100)

    phone_number: str = Field(..., max_length=20)

    address_line1: str = Field(..., max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)

    city: str = Field(..., max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    zip_code: str = Field(..., max_length=20)
    country: str = Field(..., max_length=100)

    is_default: bool = False


class AddressUpdate(BaseModel):
    label: Optional[str] = None
    recipient_first_name: Optional[str] = None
    recipient_last_name: Optional[str] = None
    phone_number: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    is_default: Optional[bool] = None


class AddressCreate(AddressBase):
    pass


class AddressResponse(AddressBase):
    address_id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AddressMessageResponse(BaseModel):
    message: str
    address: AddressResponse


class AddressListResponse(BaseModel):
    addresses: list[AddressResponse]
