"""
Vendors — full CRUD with search and filter.
"""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_role
from app.db.database import get_db
from app.db.models import CompanyEmployee, Vendor
from app.models.schemas import VendorCreate, VendorOut, VendorUpdate

router = APIRouter(prefix="/api/vendors", tags=["Vendors"])


@router.get("/", response_model=list[VendorOut])
async def list_vendors(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[CompanyEmployee, Depends(require_role("officer", "manager", "admin"))],
    search: Optional[str] = Query(None, description="Search by name or email"),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
):
    q = select(Vendor)
    if search:
        q = q.where(
            or_(
                Vendor.name.ilike(f"%{search}%"),
                Vendor.email.ilike(f"%{search}%"),
            )
        )
    if category:
        q = q.where(Vendor.category == category)
    if status:
        q = q.where(Vendor.status == status)
    q = q.offset(skip).limit(limit).order_by(Vendor.created_at.desc())
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/", response_model=VendorOut, status_code=status.HTTP_201_CREATED)
async def create_vendor(
    payload: VendorCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[CompanyEmployee, Depends(require_role("officer", "admin"))],
):
    vendor = Vendor(**payload.model_dump())
    db.add(vendor)
    await db.commit()
    await db.refresh(vendor)
    return vendor


@router.get("/{vendor_id}", response_model=VendorOut)
async def get_vendor(
    vendor_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[
        CompanyEmployee, Depends(require_role("officer", "manager", "admin", "vendor"))
    ],
):
    vendor = await db.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.put("/{vendor_id}", response_model=VendorOut)
async def update_vendor(
    vendor_id: int,
    payload: VendorUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[CompanyEmployee, Depends(require_role("officer", "admin"))],
):
    vendor = await db.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(vendor, k, v)
    await db.commit()
    await db.refresh(vendor)
    return vendor


@router.delete("/{vendor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vendor(
    vendor_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[CompanyEmployee, Depends(require_role("admin"))],
):
    vendor = await db.get(Vendor, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    await db.delete(vendor)
    await db.commit()
