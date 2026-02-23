import uuid
from enum import Enum

from pydantic import BaseModel, ConfigDict
from sqlalchemy import String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlmodel import Column, Field, SQLModel


class FormFieldType(str, Enum):
    TEXT = "text"
    TEXTAREA = "textarea"
    NUMBER = "number"
    BOOLEAN = "boolean"
    SELECT = "select"
    MULTISELECT = "multiselect"
    DATE = "date"
    EMAIL = "email"
    URL = "url"


class FormFieldBase(SQLModel):
    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    popup_id: uuid.UUID = Field(foreign_key="popups.id", index=True)
    name: str = Field(index=True)
    label: str
    field_type: str = Field(default=FormFieldType.TEXT.value)
    section: str | None = Field(default=None, nullable=True)
    position: int = Field(default=0)
    required: bool = Field(default=False)
    options: list[str] | None = Field(
        default=None, sa_column=Column(ARRAY(String), nullable=True)
    )
    placeholder: str | None = Field(default=None, nullable=True)
    help_text: str | None = Field(default=None, nullable=True)


class FormFieldPublic(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    popup_id: uuid.UUID
    name: str
    label: str
    field_type: str
    section: str | None = None
    position: int = 0
    required: bool = False
    options: list[str] | None = None
    placeholder: str | None = None
    help_text: str | None = None

    model_config = ConfigDict(from_attributes=True)


class FormFieldCreate(BaseModel):
    popup_id: uuid.UUID
    name: str
    label: str
    field_type: str = FormFieldType.TEXT.value
    section: str | None = None
    position: int = 0
    required: bool = False
    options: list[str] | None = None
    placeholder: str | None = None
    help_text: str | None = None

    model_config = ConfigDict(str_strip_whitespace=True)


class FormFieldUpdate(BaseModel):
    name: str | None = None
    label: str | None = None
    field_type: str | None = None
    section: str | None = None
    position: int | None = None
    required: bool | None = None
    options: list[str] | None = None
    placeholder: str | None = None
    help_text: str | None = None
