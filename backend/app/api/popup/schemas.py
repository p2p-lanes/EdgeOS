import uuid
from datetime import datetime
from enum import StrEnum
from typing import Self

from pydantic import model_validator
from sqlmodel import Field, SQLModel

from app.utils.utils import slugify


class PopupStatus(StrEnum):
    draft = "draft"
    active = "active"
    archived = "archived"
    ended = "ended"


class PopupBase(SQLModel):
    name: str = Field(index=True)
    tagline: str | None = None
    location: str | None = None
    slug: str = Field(unique=True, index=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenants.id", index=True)
    start_date: datetime | None = None
    end_date: datetime | None = None
    status: PopupStatus = PopupStatus.draft
    allows_spouse: bool | None = False
    allows_children: bool | None = False
    allows_coupons: bool | None = False
    image_url: str | None = None
    icon_url: str | None = None
    express_checkout_background: str | None = None
    web_url: str | None = None
    blog_url: str | None = None
    twitter_url: str | None = None
    simplefi_api_key: str | None = None


class PopupCreate(SQLModel):
    tenant_id: uuid.UUID | None = None
    name: str = Field(max_length=255)
    tagline: str | None = None
    location: str | None = None
    slug: str = ""
    start_date: datetime | None = None
    end_date: datetime | None = None
    status: PopupStatus = PopupStatus.draft
    allows_spouse: bool | None = False
    allows_children: bool | None = False
    allows_coupons: bool | None = False
    image_url: str | None = None
    icon_url: str | None = None
    express_checkout_background: str | None = None
    web_url: str | None = None
    blog_url: str | None = None
    twitter_url: str | None = None
    simplefi_api_key: str | None = None

    @model_validator(mode="after")
    def generate_slug(self) -> Self:
        self.slug = slugify(self.name)
        return self


class PopupUpdate(SQLModel):
    name: str | None = None
    tagline: str | None = None
    location: str | None = None
    slug: str | None = None
    status: PopupStatus | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    allows_spouse: bool | None = None
    allows_children: bool | None = None
    allows_coupons: bool | None = None
    image_url: str | None = None
    icon_url: str | None = None
    express_checkout_background: str | None = None
    web_url: str | None = None
    blog_url: str | None = None
    twitter_url: str | None = None
    simplefi_api_key: str | None = None


class PopupPublic(PopupBase):
    id: uuid.UUID
