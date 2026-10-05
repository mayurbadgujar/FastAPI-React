from fastapi import APIRouter, Depends, HTTPException, status
from core.roles import UserRole
from schemas.user_schema import User, UserCreate, UserLogin, LoginResponse, RegisterResponse
from services.auth_service import register_user, login_user, get_current_user

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=RegisterResponse)
async def register(data: UserCreate):
    if data.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot be registered publicly",
        )
    return await register_user(data.username, data.email, data.password, data.role)

@router.post("/login", response_model=LoginResponse)
async def login(data: UserLogin):
    return await login_user(data.username, data.password)

@router.get("/current_user", response_model=User)
async def current_user(current_user=Depends(get_current_user)):
    return current_user