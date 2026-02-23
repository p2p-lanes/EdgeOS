from pydantic import BaseModel

from app.api.shared.enums import CredentialType


class CredentialInfo(BaseModel):
    credential_type: CredentialType
    db_username: str
    db_password: str


class TenantCredentialResponse(BaseModel):
    credentials: list[CredentialInfo]
    db_host: str
    db_port: int
    db_name: str
