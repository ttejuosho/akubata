from pydantic import BaseModel, ConfigDict


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    userId: str
    firstName: str
    lastName: str
    emailAddress: str
    phoneNumber: str
    role: str
    isActive: bool
