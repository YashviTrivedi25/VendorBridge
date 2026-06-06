from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from app.core.security import decode_token
from app.core.enums import UserRole
from app.models.user import UserInDB, TokenData
from app.db.mock_store import get_user_by_id

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
) -> UserInDB:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id: str | None = payload.get("sub")
        role: str | None = payload.get("role")
        if user_id is None:
            raise credentials_exc
        token_data = TokenData(user_id=user_id, role=role)
    except JWTError:
        raise credentials_exc

    user = get_user_by_id(token_data.user_id)
    if user is None:
        raise credentials_exc
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return user


def require_role(*roles: UserRole):
    """
    Factory that returns a FastAPI dependency enforcing role membership.

    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_role(UserRole.ADMIN))])
    """
    async def role_guard(current_user: Annotated[UserInDB, Depends(get_current_user)]) -> UserInDB:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {[r.value for r in roles]}",
            )
        return current_user

    return role_guard


# ─── Convenience aliases ──────────────────────────────────────────────────────

CurrentUser = Annotated[UserInDB, Depends(get_current_user)]
OfficerOrAbove = Annotated[UserInDB, Depends(require_role(UserRole.OFFICER, UserRole.MANAGER, UserRole.ADMIN))]
ManagerOrAbove = Annotated[UserInDB, Depends(require_role(UserRole.MANAGER, UserRole.ADMIN))]
AdminOnly = Annotated[UserInDB, Depends(require_role(UserRole.ADMIN))]
VendorOnly = Annotated[UserInDB, Depends(require_role(UserRole.VENDOR))]
