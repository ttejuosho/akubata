from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class SignupRequest(BaseModel):
    firstName: str
    lastName: str
    emailAddress: str
    phoneNumber: str
    password: str
    confirmPassword: str
    role: str = "admin"


class LoginRequest(BaseModel):
    emailAddress: str
    password: str


class ForgotPasswordRequest(BaseModel):
    emailAddress: str


class ResetPasswordRequest(BaseModel):
    newPassword: str
    confirmPassword: str


class InAppPasswordResetRequest(BaseModel):
    newPassword: str
    confirmNewPassword: str