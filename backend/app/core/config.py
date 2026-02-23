from enum import StrEnum
from typing import Annotated, Any, Self
from urllib.parse import quote

from dotenv import load_dotenv
from pydantic import (
    AnyUrl,
    BeforeValidator,
    EmailStr,
    Field,
    HttpUrl,
    PostgresDsn,
    computed_field,
    model_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",") if i.strip()]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)


class Environment(StrEnum):
    DEV = "dev"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_ignore_empty=True,
        extra="ignore",
    )
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = Field(...)
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    BACKOFFICE_URL: str = "http://localhost:5173"
    ENVIRONMENT: Environment = Environment.DEV

    BACKEND_CORS_ORIGINS: Annotated[
        list[AnyUrl] | str, BeforeValidator(parse_cors)
    ] = []

    @computed_field
    @property
    def all_cors_origins(self) -> list[str]:
        return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS] + [
            self.BACKOFFICE_URL,
            self.PORTAL_URL,
        ]

    @computed_field
    @property
    def cors_allow_origin_regex(self) -> str | None:
        """Allow any subdomain of localhost in dev for multi-tenant portal."""
        if self.ENVIRONMENT == Environment.DEV:
            return r"^https?://[\w-]+\.localhost(:\d+)?$"
        return None

    PROJECT_NAME: str = Field(...)
    SENTRY_DSN: HttpUrl | None = None
    POSTGRES_SERVER: str = Field(...)
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = Field(...)
    POSTGRES_PASSWORD: str = Field(...)
    POSTGRES_DB: str = ""
    POSTGRES_SSL_MODE: str = "require"

    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        return PostgresDsn.build(
            scheme="postgresql+psycopg",
            username=self.POSTGRES_USER,
            password=quote(self.POSTGRES_PASSWORD, safe=""),
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
            query=f"sslmode={self.POSTGRES_SSL_MODE}",
        )

    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    SMTP_PORT: int = 587
    SMTP_HOST: str | None = None
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    SENDER_EMAIL: EmailStr | None = None
    SENDER_NAME: str | None = None

    @model_validator(mode="after")
    def _set_default_sender_name(self) -> Self:
        if not self.SENDER_NAME:
            self.SENDER_NAME = self.PROJECT_NAME
        return self

    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 48

    @computed_field
    @property
    def emails_enabled(self) -> bool:
        return bool(self.SMTP_HOST and self.SENDER_EMAIL)

    EMAIL_TEST_USER: EmailStr = "test@example.com"

    SUPERADMIN: EmailStr = Field(...)

    # Storage configuration (S3-compatible)
    STORAGE_ENDPOINT_URL: str | None = None  # None = AWS S3
    STORAGE_ACCESS_KEY: str = ""
    STORAGE_SECRET_KEY: str = ""
    STORAGE_BUCKET: str = "uploads"
    STORAGE_REGION: str = "us-east-2"
    STORAGE_PUBLIC_URL: str | None = None  # Optional CDN/public URL prefix

    @computed_field
    @property
    def storage_enabled(self) -> bool:
        return bool(self.STORAGE_ACCESS_KEY and self.STORAGE_SECRET_KEY)

    REDIS_URL: str | None = None

    # SimpleFI payment provider
    BACKEND_URL: str = "http://localhost:8000"
    PORTAL_URL: str = "http://localhost:3000"

    @computed_field
    @property
    def SIMPLEFI_API_URL(self) -> str:
        if self.ENVIRONMENT == Environment.PRODUCTION:
            return "https://api.simplefi.tech"
        return "https://api-dev.simplefi.tech"


settings = Settings()
