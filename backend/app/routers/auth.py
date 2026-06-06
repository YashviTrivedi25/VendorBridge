from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from fastapi import Depends

from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import CurrentUser
from app.models.user import UserCreate, UserOut, Token, UserInDB
from app.db.mock_store import create_user, email_exists, get_user_by_email

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate):
    """Register a new user. Roles: officer, vendor, manager, admin."""
    if email_exists(payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    user_in_db = UserInDB(
        id=uuid4(),
        email=payload.email,
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone=payload.phone,
        country=payload.country,
        role=payload.role,
        additional_info=payload.additional_info,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        hashed_password=hash_password(payload.password),
    )
    created = create_user(user_in_db)
    return created


@router.post("/login", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """
    OAuth2 password flow — returns a Bearer JWT.
    username field should contain the user's email.
    """
    user = get_user_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive account.")

    token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return Token(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
async def get_me(current_user: CurrentUser):
    """Return the currently authenticated user's profile."""
    return current_user
