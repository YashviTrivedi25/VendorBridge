from fastapi import APIRouter, Depends
from app.core.dependencies import require_role
from app.core.enums import UserRole

router = APIRouter(prefix="/api/quotations", tags=["Quotations"])


@router.get("/", dependencies=[Depends(require_role(UserRole.OFFICER, UserRole.MANAGER, UserRole.ADMIN, UserRole.VENDOR))])
async def list_quotations():
    """[Phase 2] List quotations."""
    return {"message": "Quotations list — Phase 2"}


@router.post("/", dependencies=[Depends(require_role(UserRole.VENDOR))])
async def submit_quotation():
    """[Phase 2] Vendor submits a quotation for an RFQ."""
    return {"message": "Submit quotation — Phase 2"}


@router.get("/{rfq_id}/compare", dependencies=[Depends(require_role(UserRole.OFFICER, UserRole.MANAGER, UserRole.ADMIN))])
async def compare_quotations(rfq_id: str):
    """[Phase 2] Compare quotations for a specific RFQ."""
    return {"message": f"Compare quotations for RFQ {rfq_id} — Phase 2"}


@router.post("/{quotation_id}/approve", dependencies=[Depends(require_role(UserRole.MANAGER, UserRole.ADMIN))])
async def approve_quotation(quotation_id: str):
    """[Phase 2] Approve or reject a quotation (initiates PO workflow)."""
    return {"message": f"Approve quotation {quotation_id} — Phase 2"}


@router.get("/{quotation_id}", dependencies=[Depends(require_role(UserRole.OFFICER, UserRole.MANAGER, UserRole.ADMIN, UserRole.VENDOR))])
async def get_quotation(quotation_id: str):
    """[Phase 2] Get quotation by ID."""
    return {"message": f"Quotation {quotation_id} — Phase 2"}

