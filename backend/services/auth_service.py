from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from sqlalchemy import func, select
from core.config import settings
from core.roles import UserRole
from schemas.user_schema import LoginResponse, RegisterResponse, User
from database.connection import database
from database.user import users
from core.security import hash_password, verify_password
from utils.jwt_handlers import create_access_token

security = HTTPBearer()


def _normalize_role(raw_role: UserRole | str | None) -> UserRole:
    if raw_role is None:
        return UserRole.PATIENT
    if isinstance(raw_role, UserRole):
        return raw_role
    return UserRole(str(raw_role))


async def register_user(
    username: str,
    email: str,
    password: str,
    role: UserRole = UserRole.PATIENT,
) -> RegisterResponse:
    query = users.select().where((users.c.username == username) & (users.c.is_active == True))
    existing_user = await database.fetch_one(query)

    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    count_query = select(func.count()).select_from(users)
    user_count = await database.fetch_val(count_query)
    resolved_role = UserRole.ADMIN.value if user_count == 0 else role.value

    if user_count > 0 and resolved_role == UserRole.ADMIN.value:
        raise HTTPException(
            status_code=403,
            detail="Admin accounts can only be created for the first user",
        )

    if resolved_role not in {UserRole.PATIENT.value, UserRole.DOCTOR.value, UserRole.ADMIN.value}:
        raise HTTPException(status_code=400, detail="Invalid role")

    hashed_password = hash_password(password)

    query = users.insert().values(
        username=username,
        email=email,
        password_hash=hashed_password,
        is_active=True,
        role=resolved_role,
    )
    await database.execute(query)

    return RegisterResponse(
        message="User registered successfully",
        role=UserRole(resolved_role),
    )


async def login_user(username: str, password: str) -> LoginResponse:
    query = users.select().where((users.c.username == username) & (users.c.is_active == True))
    user = await database.fetch_one(query)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid password")

    role = _normalize_role(user["role"])
    access_token = create_access_token({"sub": user["username"], "role": role.value})
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=User(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            is_active=user["is_active"],
            role=role,
        ),
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str | None = payload.get("sub")
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

    user_data = dict(user)
    user_data["role"] = _normalize_role(user_data.get("role"))
    return User(**user_data)
