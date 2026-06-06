from fastapi import APIRouter, Depends
from app.core.dependencies import require_role
from app.core.enums import UserRole

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/", dependencies=[Depends(require_role(UserRole.ADMIN))])
async def list_users():
    """[Phase 2] List all users (Admin only)."""
    return {"message": "Users list — Phase 2"}


@router.get("/{user_id}", dependencies=[Depends(require_role(UserRole.ADMIN))])
async def get_user(user_id: str):
    """[Phase 2] Get user by ID (Admin only)."""
    return {"message": f"Get user {user_id} — Phase 2"}
