"""Upload API schemas."""

from pydantic import BaseModel, Field


class PresignedUrlRequest(BaseModel):
    """Request to generate a presigned upload URL."""

    filename: str = Field(..., description="Original filename")
    content_type: str = Field(..., description="MIME type of the file")


class PresignedUrlResponse(BaseModel):
    """Response with presigned URL for upload."""

    upload_url: str = Field(..., description="Presigned URL for PUT upload")
    key: str = Field(..., description="Storage key for the file")
    public_url: str = Field(..., description="Public URL after upload")
