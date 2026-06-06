from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.core.enums import UserRole


# ─── Request / Response Schemas ───────────────────────────────────────────────


class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = None
    country: Optional[str] = None
    role: UserRole = UserRole.OFFICER
    company_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    gst_number: Optional[str] = None
    category: Optional[str] = None


class UserOut(BaseModel):
    id: str  # cast int → str so frontend stays unchanged
    email: str
    first_name: str
    last_name: str
    role: str
    company_name: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── Internal DB representation (legacy — replaced by ORM model) ─────────────


class UserInDB(UserOut):
    hashed_password: str


# ─── Token Schemas ────────────────────────────────────────────────────────────


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[UserRole] = None
