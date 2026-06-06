from fastapi import APIRouter, Depends
from app.core.dependencies import require_role
from app.core.enums import UserRole

router = APIRouter(prefix="/api/activity-logs", tags=["Activity Logs"])


@router.get("/", dependencies=[Depends(require_role(UserRole.MANAGER, UserRole.ADMIN))])
async def list_activity_logs():
    """[Phase 2] List activity logs (manager / admin only)."""
    return {"message": "Activity logs — Phase 2"}
