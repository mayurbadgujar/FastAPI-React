from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from core.config import settings
from schemas.user_schema import User
from database.connection import database
from database.user import users
from core.security import hash_password, verify_password
from utils.jwt_handlers import create_access_token

security = HTTPBearer()
    
async def register_user(username: str, email: str, password: str):
    query = users.select().where((users.c.username == username) & (users.c.is_active == True))
    existing_user = await database.fetch_one(query)

    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = hash_password(password)

    query = users.insert().values(
        username=username,
        email=email,
        password_hash=hashed_password,
        is_active=True
    )
    await database.execute(query)

    return {"message": "User registered successfully"}

async def login_user(username: str, password: str):
    query = users.select().where((users.c.username == username) & (users.c.is_active == True))
    user = await database.fetch_one(query)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid password")

    access_token = create_access_token({"sub": user["username"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "is_active": user["is_active"],
        },
    }

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    
    query = users.select().where((users.c.username == username) & (users.c.is_active == True))
    user = await database.fetch_one(query)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)
