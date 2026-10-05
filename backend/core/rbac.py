from collections.abc import Awaitable, Callable

from fastapi import Depends, HTTPException, status

from core.roles import UserRole
from schemas.user_schema import User
from services.auth_service import get_current_user

RoleDependency = Callable[..., Awaitable[User]]


def require_roles(*allowed_roles: UserRole) -> RoleDependency:
    allowed = set(allowed_roles)

    async def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return dependency
