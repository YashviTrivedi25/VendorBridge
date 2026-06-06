from fastapi import APIRouter, Depends
from app.core.dependencies import require_role
from app.core.enums import UserRole

router = APIRouter(prefix="/api/rfqs", tags=["RFQs"])


@router.get("/", dependencies=[Depends(require_role(UserRole.OFFICER, UserRole.MANAGER, UserRole.ADMIN, UserRole.VENDOR))])
async def list_rfqs():
    """[Phase 2] List all Request-for-Quotations. Vendors can see their invited RFQs."""
    return {"message": "RFQ list — Phase 2"}


@router.post("/", dependencies=[Depends(require_role(UserRole.OFFICER))])
async def create_rfq():
    """[Phase 2] Create a new RFQ (Procurement Officer)."""
    return {"message": "Create RFQ — Phase 2"}


@router.get("/{rfq_id}", dependencies=[Depends(require_role(UserRole.OFFICER, UserRole.MANAGER, UserRole.ADMIN, UserRole.VENDOR))])
async def get_rfq(rfq_id: str):
    """[Phase 2] Get RFQ by ID."""
    return {"message": f"RFQ {rfq_id} — Phase 2"}

