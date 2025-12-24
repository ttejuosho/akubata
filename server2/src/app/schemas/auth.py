from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class SignupRequest(BaseModel):
    firstName: str
    lastName: str
    emailAddress: EmailStr
    phoneNumber: str | None = None
    password: str
    confirmPassword: str
    role: str = "admin"


class LoginRequest(BaseModel):
    emailAddress: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    emailAddress: EmailStr


class ResetPasswordRequest(BaseModel):
    newPassword: str
    confirmPassword: str


class InAppPasswordResetRequest(BaseModel):
    newPassword: str
    confirmNewPassword: str