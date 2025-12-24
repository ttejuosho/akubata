from pydantic import BaseModel, EmailStr, ConfigDict


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    userId: str
    firstName: str
    lastName: str
    emailAddress: EmailStr
    phoneNumber: str | None
    role: str
    isActive: bool
