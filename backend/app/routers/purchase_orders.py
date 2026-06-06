from fastapi import APIRouter, Depends
from app.core.dependencies import require_role
from app.core.enums import UserRole

router = APIRouter(prefix="/api/purchase-orders", tags=["Purchase Orders"])


@router.get("/", dependencies=[Depends(require_role(UserRole.OFFICER, UserRole.MANAGER, UserRole.ADMIN, UserRole.VENDOR))])
async def list_purchase_orders():
    """[Phase 2] List purchase orders. Vendors can view their own."""
    return {"message": "Purchase orders list — Phase 2"}


@router.post("/", dependencies=[Depends(require_role(UserRole.OFFICER))])
async def create_purchase_order():
    """[Phase 2] Generate a purchase order (Procurement Officer)."""
    return {"message": "Create PO — Phase 2"}


@router.post("/{po_id}/approve", dependencies=[Depends(require_role(UserRole.MANAGER, UserRole.ADMIN))])
async def approve_purchase_order(po_id: str):
    """[Phase 2] Approve a purchase order (Manager/Approver)."""
    return {"message": f"Approve PO {po_id} — Phase 2"}


@router.get("/{po_id}", dependencies=[Depends(require_role(UserRole.OFFICER, UserRole.MANAGER, UserRole.ADMIN, UserRole.VENDOR))])
async def get_purchase_order(po_id: str):
    """[Phase 2] Get PO by ID."""
    return {"message": f"PO {po_id} — Phase 2"}

