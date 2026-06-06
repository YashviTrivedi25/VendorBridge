"""
Activity Logs — list with module filter (Manager/Admin only).
"""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_role
from app.db.database import get_db
from app.db.models import ActivityLog, CompanyEmployee
from app.models.schemas import ActivityLogOut

router = APIRouter(prefix="/api/activity-logs", tags=["Activity Logs"])


@router.get("/", response_model=list[ActivityLogOut])
async def list_activity_logs(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[CompanyEmployee, Depends(require_role("manager", "admin"))],
    module: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 100,
):
    q = (
        select(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    if module:
        q = q.where(ActivityLog.module == module)
    result = await db.execute(q)
    return result.scalars().all()
