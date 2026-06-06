from fastapi import APIRouter, Depends
from app.core.dependencies import OfficerOrAbove, ManagerOrAbove, require_role
from app.core.enums import UserRole

router = APIRouter(prefix="/api/vendors", tags=["Vendors"])


@router.get("/", dependencies=[Depends(require_role(UserRole.OFFICER, UserRole.MANAGER, UserRole.ADMIN))])
async def list_vendors():
    """[Phase 2] List all vendors. Requires officer / manager / admin."""
    return {"message": "Vendor list — connect Supabase in Phase 2"}


@router.post("/", dependencies=[Depends(require_role(UserRole.OFFICER, UserRole.MANAGER, UserRole.ADMIN))])
async def create_vendor():
    """[Phase 2] Create a new vendor."""
    return {"message": "Create vendor — Phase 2"}


@router.get("/{vendor_id}", dependencies=[Depends(require_role(UserRole.OFFICER, UserRole.MANAGER, UserRole.ADMIN, UserRole.VENDOR))])
async def get_vendor(vendor_id: str):
    """[Phase 2] Get vendor by ID."""
    return {"message": f"Vendor {vendor_id} — Phase 2"}
