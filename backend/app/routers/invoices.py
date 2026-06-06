"""
Invoices — generate from PO, mark as sent/paid.
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_role
from app.db.database import get_db
from app.db.models import CompanyEmployee, Invoice, PurchaseOrder
from app.models.schemas import InvoiceCreate, InvoiceOut, InvoiceUpdate

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])


@router.get("/", response_model=list[InvoiceOut])
async def list_invoices(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[
        CompanyEmployee, Depends(require_role("officer", "manager", "admin", "vendor"))
    ],
    skip: int = 0,
    limit: int = 50,
):
    result = await db.execute(
        select(Invoice).order_by(Invoice.updated_at.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.post("/", response_model=InvoiceOut, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    payload: InvoiceCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[CompanyEmployee, Depends(require_role("officer", "vendor"))],
):
    po = await db.get(PurchaseOrder, payload.po_id)
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")

    invoice = Invoice(
        po_id=payload.po_id,
        invoice_number=f"INV-{uuid.uuid4().hex[:8].upper()}",
        subtotal=payload.subtotal,
        gst=payload.gst,
        grand_total=payload.grand_total,
        due_date=payload.due_date,
        status="Unpaid",
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)
    return invoice


@router.post("/{invoice_id}/send", response_model=InvoiceOut)
async def send_invoice(
    invoice_id: int,
    payload: InvoiceUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[CompanyEmployee, Depends(require_role("officer", "vendor"))],
):
    invoice = await db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice.status = payload.status or "Sent"
    await db.commit()
    await db.refresh(invoice)
    return invoice


@router.get("/{invoice_id}", response_model=InvoiceOut)
async def get_invoice(
    invoice_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[
        CompanyEmployee, Depends(require_role("officer", "manager", "admin", "vendor"))
    ],
):
    invoice = await db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice
