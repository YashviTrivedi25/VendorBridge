from fastapi import APIRouter, Depends
from app.core.dependencies import require_role
from app.core.enums import UserRole

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])


@router.get("/", dependencies=[Depends(require_role(UserRole.OFFICER, UserRole.MANAGER, UserRole.ADMIN, UserRole.VENDOR))])
async def list_invoices():
    """[Phase 2] List all invoices."""
    return {"message": "Invoices list — Phase 2"}


@router.post("/", dependencies=[Depends(require_role(UserRole.OFFICER, UserRole.VENDOR))])
async def submit_invoice():
    """[Phase 2] Vendor or Officer submits/generates an invoice."""
    return {"message": "Submit invoice — Phase 2"}


@router.post("/{invoice_id}/send", dependencies=[Depends(require_role(UserRole.OFFICER, UserRole.VENDOR))])
async def send_invoice(invoice_id: str):
    """[Phase 2] Print or email an invoice."""
    return {"message": f"Send/print invoice {invoice_id} — Phase 2"}


@router.get("/{invoice_id}", dependencies=[Depends(require_role(UserRole.OFFICER, UserRole.MANAGER, UserRole.ADMIN, UserRole.VENDOR))])
async def get_invoice(invoice_id: str):
    """[Phase 2] Get invoice by ID."""
    return {"message": f"Invoice {invoice_id} — Phase 2"}

