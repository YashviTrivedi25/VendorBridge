from enum import Enum


class UserRole(str, Enum):
    OFFICER = "officer"
    VENDOR = "vendor"
    MANAGER = "manager"
    ADMIN = "admin"
