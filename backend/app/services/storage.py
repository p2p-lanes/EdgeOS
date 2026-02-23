"""S3-compatible storage service for file uploads."""

from typing import Protocol

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from app.core.config import settings

# Maximum file size: 10 MB
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024


class StorageServiceProtocol(Protocol):
    """Protocol for storage service implementations."""

    def generate_upload_url(
        self,
        key: str,
        content_type: str,
        expires_in: int = 3600,
    ) -> str:
        """Generate a presigned URL for uploading a file."""
        ...

    def generate_download_url(self, key: str, expires_in: int = 3600) -> str:
        """Generate a presigned URL for downloading a file."""
        ...

    def get_public_url(self, key: str) -> str:
        """Get the public URL for a file (if bucket is public)."""
        ...

    def delete(self, key: str) -> None:
        """Delete a file from storage."""
        ...

    def exists(self, key: str) -> bool:
        """Check if a file exists in storage."""
        ...

    def list_keys(self, prefix: str) -> list[str]:
        """List all keys with a given prefix."""
        ...


class S3CompatibleStorage:
    """S3-compatible storage service using boto3."""

    def __init__(self) -> None:
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.STORAGE_ENDPOINT_URL,
            aws_access_key_id=settings.STORAGE_ACCESS_KEY,
            aws_secret_access_key=settings.STORAGE_SECRET_KEY,
            region_name=settings.STORAGE_REGION,
            config=Config(signature_version="s3v4"),
        )
        self.bucket = settings.STORAGE_BUCKET
        self.public_url = settings.STORAGE_PUBLIC_URL
        self.endpoint_url = settings.STORAGE_ENDPOINT_URL

    def generate_upload_url(
        self,
        key: str,
        content_type: str,
        expires_in: int = 3600,
    ) -> str:
        """Generate a presigned URL for PUT upload."""
        return self.client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": self.bucket,
                "Key": key,
                "ContentType": content_type,
            },
            ExpiresIn=expires_in,
        )

    def generate_download_url(self, key: str, expires_in: int = 3600) -> str:
        """Generate a presigned URL for GET download."""
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=expires_in,
        )

    def get_public_url(self, key: str) -> str:
        """
        Get the public URL for a file.
        Uses STORAGE_PUBLIC_URL if set (CDN), otherwise constructs from endpoint.
        """
        if self.public_url:
            return f"{self.public_url.rstrip('/')}/{key}"
        if self.endpoint_url:
            return f"{self.endpoint_url.rstrip('/')}/{self.bucket}/{key}"
        return f"https://{self.bucket}.s3.{settings.STORAGE_REGION}.amazonaws.com/{key}"

    def delete(self, key: str) -> None:
        """Delete a file from the bucket."""
        self.client.delete_object(Bucket=self.bucket, Key=key)

    def delete_many(self, keys: list[str]) -> dict:
        """Delete multiple files from the bucket."""
        if not keys:
            return {"Deleted": [], "Errors": []}

        objects = [{"Key": key} for key in keys]
        return self.client.delete_objects(
            Bucket=self.bucket,
            Delete={"Objects": objects, "Quiet": False},
        )

    def exists(self, key: str) -> bool:
        """Check if a file exists in storage."""
        try:
            self.client.head_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError:
            return False

    def list_keys(self, prefix: str) -> list[str]:
        """List all keys with a given prefix."""
        paginator = self.client.get_paginator("list_objects_v2")
        keys = []
        for page in paginator.paginate(Bucket=self.bucket, Prefix=prefix):
            for obj in page.get("Contents", []):
                keys.append(obj["Key"])
        return keys

    def get_object_metadata(self, key: str) -> dict | None:
        """Get metadata for an object (size, content-type, last modified)."""
        try:
            response = self.client.head_object(Bucket=self.bucket, Key=key)
            return {
                "size": response["ContentLength"],
                "content_type": response["ContentType"],
                "last_modified": response["LastModified"],
                "etag": response["ETag"],
            }
        except ClientError:
            return None


def get_storage_service() -> S3CompatibleStorage | None:
    """Get storage service instance if configured."""
    if not settings.storage_enabled:
        return None
    return S3CompatibleStorage()


# Lazy singleton instance
_storage_service: S3CompatibleStorage | None = None


def storage_service() -> S3CompatibleStorage:
    """Get the singleton storage service instance."""
    global _storage_service
    if _storage_service is None:
        if not settings.storage_enabled:
            raise RuntimeError("Storage is not configured")
        _storage_service = S3CompatibleStorage()
    return _storage_service
