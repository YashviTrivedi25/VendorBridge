"""
Users (Employees) — admin management.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_role
from app.db.database import get_db
from app.db.models import CompanyEmployee
from app.models.schemas import EmployeeOut, EmployeeUpdate

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/", response_model=list[EmployeeOut])
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[CompanyEmployee, Depends(require_role("admin"))],
    skip: int = 0,
    limit: int = 100,
):
    result = await db.execute(
        select(CompanyEmployee)
        .order_by(CompanyEmployee.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/{user_id}", response_model=EmployeeOut)
async def get_user(
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[CompanyEmployee, Depends(require_role("admin"))],
):
    user = await db.get(CompanyEmployee, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}", response_model=EmployeeOut)
async def update_user(
    user_id: int,
    payload: EmployeeUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[CompanyEmployee, Depends(require_role("admin"))],
):
    user = await db.get(CompanyEmployee, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(user, k, v)
    await db.commit()
    await db.refresh(user)
    return user
