from enum import Enum


class UserRole(str, Enum):
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    VIEWER = "viewer"


class CredentialType(str, Enum):
    CRUD = "crud"
    READONLY = "readonly"
