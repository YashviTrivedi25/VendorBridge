"""
Quotations — vendor submission, officer comparison, manager approval.
"""

from datetime import datetime, timezone
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import require_role
from app.db.database import get_db
from app.db.models import Approval, CompanyEmployee, Quotation, QuotationItem
from app.models.schemas import QuotationApprove, QuotationCreate, QuotationOut

router = APIRouter(prefix="/api/quotations", tags=["Quotations"])


@router.get("/", response_model=list[QuotationOut])
async def list_quotations(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[
        CompanyEmployee, Depends(require_role("officer", "manager", "admin", "vendor"))
    ],
    rfq_id: Optional[int] = Query(None),
    vendor_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 50,
):
    q = (
        select(Quotation)
        .options(selectinload(Quotation.items))
        .offset(skip)
        .limit(limit)
    )
    if rfq_id:
        q = q.where(Quotation.rfq_id == rfq_id)
    if vendor_id:
        q = q.where(Quotation.vendor_id == vendor_id)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/", response_model=QuotationOut, status_code=status.HTTP_201_CREATED)
async def submit_quotation(
    payload: QuotationCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[CompanyEmployee, Depends(require_role("vendor"))],
):
    quot = Quotation(
        rfq_id=payload.rfq_id,
        vendor_id=payload.vendor_id,
        total_price=payload.total_price,
        delivery_days=payload.delivery_days,
        notes=payload.notes,
        status="Submitted",
    )
    db.add(quot)
    await db.flush()
    for item in payload.items:
        db.add(QuotationItem(quotation_id=quot.id, **item.model_dump()))
    await db.commit()
    await db.refresh(quot)
    result = await db.execute(
        select(Quotation)
        .options(selectinload(Quotation.items))
        .where(Quotation.id == quot.id)
    )
    return result.scalar_one()


@router.get("/{rfq_id}/compare", response_model=list[QuotationOut])
async def compare_quotations(
    rfq_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[CompanyEmployee, Depends(require_role("officer", "manager", "admin"))],
):
    result = await db.execute(
        select(Quotation)
        .options(selectinload(Quotation.items))
        .where(Quotation.rfq_id == rfq_id)
    )
    return result.scalars().all()


@router.post("/{quotation_id}/approve", response_model=dict)
async def approve_quotation(
    quotation_id: int,
    payload: QuotationApprove,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[CompanyEmployee, Depends(require_role("manager", "admin"))],
):
    quot = await db.get(Quotation, quotation_id)
    if not quot:
        raise HTTPException(status_code=404, detail="Quotation not found")

    quot.status = payload.status
    approval = Approval(
        quotation_id=quotation_id,
        approver_id=current_user.id,
        status=payload.status,
        remarks=payload.remarks,
        approved_at=datetime.now(timezone.utc)
        if payload.status == "Approved"
        else None,
    )
    db.add(approval)
    await db.commit()
    return {"message": f"Quotation {payload.status}", "quotation_id": quotation_id}


@router.get("/detail/{quotation_id}", response_model=QuotationOut)
async def get_quotation(
    quotation_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[
        CompanyEmployee, Depends(require_role("officer", "manager", "admin", "vendor"))
    ],
):
    result = await db.execute(
        select(Quotation)
        .options(selectinload(Quotation.items))
        .where(Quotation.id == quotation_id)
    )
    quot = result.scalar_one_or_none()
    if not quot:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return quot
