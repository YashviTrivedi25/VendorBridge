from pydantic import BaseModel, EmailStr, Field
from uuid import UUID, uuid4
from datetime import datetime
from app.core.enums import UserRole


# ─── Request / Response Schemas ───────────────────────────────────────────────

class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: str | None = None
    country: str | None = None
    role: UserRole = UserRole.OFFICER
    additional_info: str | None = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserOut(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Internal DB representation (in-memory, swapped for ORM in Phase 2) ──────

class UserInDB(UserOut):
    hashed_password: str


# ─── Token Schemas ────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenData(BaseModel):
    user_id: str | None = None
    role: UserRole | None = None
