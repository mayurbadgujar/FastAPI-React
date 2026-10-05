from pydantic import BaseModel, Field

from core.roles import UserRole


class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: UserRole = Field(default=UserRole.PATIENT)

class UserLogin(BaseModel):
    username: str
    password: str

class UserToken(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    role: UserRole = UserRole.PATIENT

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

class RegisterResponse(BaseModel):
    message: str
    role: UserRole
