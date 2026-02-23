"""Upload API router."""

from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.api.upload.schemas import PresignedUrlRequest, PresignedUrlResponse
from app.core.config import settings
from app.core.dependencies.users import CurrentUser
from app.services.storage import storage_service

router = APIRouter(prefix="/uploads", tags=["uploads"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}


@router.post("/presigned-url", response_model=PresignedUrlResponse)
async def get_presigned_upload_url(
    request: PresignedUrlRequest,
    current_user: CurrentUser,
) -> PresignedUrlResponse:
    """
    Generate a presigned URL for direct upload to storage.

    The client should:
    1. Call this endpoint to get an upload URL
    2. PUT the file directly to the upload_url with the correct Content-Type
    3. Use the returned key or public_url when saving to the database
    """
    if not settings.storage_enabled:
        raise HTTPException(
            status_code=503,
            detail="Storage is not configured",
        )

    # Validate content type
    if request.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Content type must be one of: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}",
        )

    # Generate unique key with tenant isolation
    # Format: {tenant_id}/images/{uuid}.{extension}
    extension = (
        request.filename.rsplit(".", 1)[-1].lower()
        if "." in request.filename
        else "bin"
    )
    # Sanitize extension
    if not extension.isalnum() or len(extension) > 10:
        extension = "bin"

    tenant_id = current_user.tenant_id or "superadmin"
    key = f"{tenant_id}/images/{uuid4()}.{extension}"

    storage = storage_service()
    upload_url = storage.generate_upload_url(
        key=key,
        content_type=request.content_type,
        expires_in=3600,  # 1 hour
    )

    public_url = storage.get_public_url(key)

    return PresignedUrlResponse(
        upload_url=upload_url,
        key=key,
        public_url=public_url,
    )
