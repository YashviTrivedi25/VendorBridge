"""
In-memory mock store — replaces this entire file with Supabase/SQLAlchemy calls in Phase 2.
Keyed by email for O(1) lookup during login.
"""
from uuid import uuid4
from datetime import datetime, timezone

from app.models.user import UserInDB
from app.core.enums import UserRole
from app.core.security import hash_password

# Dict[email -> UserInDB]
_users: dict[str, UserInDB] = {}

# Seed one admin for local dev
_admin = UserInDB(
    id=uuid4(),
    email="admin@vendorbridge.com",
    first_name="Admin",
    last_name="User",
    role=UserRole.ADMIN,
    is_active=True,
    created_at=datetime.now(timezone.utc),
    hashed_password=hash_password("Admin@1234"),
)
_users[_admin.email] = _admin


def get_user_by_email(email: str) -> UserInDB | None:
    return _users.get(email)


def get_user_by_id(user_id: str) -> UserInDB | None:
    for user in _users.values():
        if str(user.id) == user_id:
            return user
    return None


def create_user(user: UserInDB) -> UserInDB:
    _users[user.email] = user
    return user


def email_exists(email: str) -> bool:
    return email in _users
