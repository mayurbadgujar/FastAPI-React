from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

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

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

class RegisterResponse(BaseModel):
    message: str
