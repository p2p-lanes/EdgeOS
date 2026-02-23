import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict
from sqlalchemy import Text
from sqlmodel import Field, SQLModel


class EmailTemplateType(StrEnum):
    LOGIN_CODE_USER = "login_code_user"
    LOGIN_CODE_HUMAN = "login_code_human"
    APPLICATION_RECEIVED = "application_received"
    APPLICATION_ACCEPTED = "application_accepted"
    APPLICATION_REJECTED = "application_rejected"
    PAYMENT_CONFIRMED = "payment_confirmed"
    ABANDONED_CART = "abandoned_cart"
    EDIT_PASSES_CONFIRMED = "edit_passes_confirmed"


class EmailTemplateBase(SQLModel):
    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    popup_id: uuid.UUID = Field(foreign_key="popups.id", index=True)
    template_type: str = Field(index=True)
    subject: str | None = Field(default=None, nullable=True)
    html_content: str = Field(sa_type=Text())
    is_active: bool = Field(default=True)


class EmailTemplatePublic(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    popup_id: uuid.UUID
    template_type: str
    subject: str | None = None
    html_content: str
    is_active: bool = True
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class EmailTemplateCreate(BaseModel):
    popup_id: uuid.UUID
    template_type: str
    subject: str | None = None
    html_content: str
    is_active: bool = True

    model_config = ConfigDict(str_strip_whitespace=True)


class EmailTemplateUpdate(BaseModel):
    subject: str | None = None
    html_content: str | None = None
    is_active: bool | None = None
