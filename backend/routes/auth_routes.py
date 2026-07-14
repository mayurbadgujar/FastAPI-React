from fastapi import APIRouter, Depends, status
from schemas.user_schema import User, UserCreate, UserLogin, LoginResponse, RegisterResponse
from services.auth_service import register_user, login_user, get_current_user

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=RegisterResponse)
async def register(data: UserCreate):
    return await register_user(data.username, data.email, data.password)

@router.post("/login", response_model=LoginResponse)
async def login(data: UserLogin):
    return await login_user(data.username, data.password)

@router.get("/current_user", response_model=User)
async def current_user(current_user=Depends(get_current_user)):
    return current_user