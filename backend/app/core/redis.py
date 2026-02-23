"""Redis client module for caching and rate limiting.

Configure via REDIS_URL environment variable:
- Local: redis://redis:6379
"""

import uuid
from datetime import timedelta

import redis
from loguru import logger

from app.core.config import settings

# Redis client singleton (lazy initialization)
_redis_client: redis.Redis | None = None


def get_redis() -> redis.Redis | None:
    """Get Redis client instance. Returns None if Redis is not configured."""
    global _redis_client

    if not settings.REDIS_URL:
        return None

    if _redis_client is None:
        try:
            _redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
            )
            # Test connection
            _redis_client.ping()
            logger.info("Redis connection established")
        except redis.ConnectionError as e:
            logger.warning(f"Failed to connect to Redis: {e}")
            _redis_client = None

    return _redis_client


class RateLimiter:
    """Rate limiter using Redis sliding window with in-memory fallback."""

    def __init__(self, prefix: str, max_requests: int, window_seconds: int):
        self.prefix = prefix
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        # In-memory fallback (half the normal limit)
        self._memory: dict[str, list[float]] = {}
        self._lock = __import__("threading").Lock()

    def _get_key(self, identifier: str) -> str:
        return f"ratelimit:{self.prefix}:{identifier}"

    def _is_allowed_memory(self, identifier: str) -> tuple[bool, int]:
        """In-memory sliding window fallback (half the normal limit)."""
        import time

        now = time.time()
        memory_limit = max(1, self.max_requests // 2)

        with self._lock:
            if identifier not in self._memory:
                self._memory[identifier] = []

            # Remove expired entries
            window_start = now - self.window_seconds
            self._memory[identifier] = [
                t for t in self._memory[identifier] if t > window_start
            ]

            current_count = len(self._memory[identifier])
            if current_count >= memory_limit:
                return False, 0

            self._memory[identifier].append(now)
            return True, memory_limit - current_count - 1

    def is_allowed(self, identifier: str) -> tuple[bool, int]:
        """
        Check if request is allowed for the given identifier.

        Returns:
            tuple: (is_allowed, remaining_requests)
        """
        client = get_redis()
        if client is None:
            return self._is_allowed_memory(identifier)

        key = self._get_key(identifier)

        try:
            current = client.get(key)
            if current is None:
                # First request, set counter with expiration
                client.setex(key, self.window_seconds, 1)
                return True, self.max_requests - 1

            current_count = int(current)  # type: ignore[arg-type]
            if current_count >= self.max_requests:
                # Get TTL for retry-after header
                return False, 0

            # Increment counter
            client.incr(key)
            return True, self.max_requests - current_count - 1

        except redis.RedisError as e:
            logger.warning(f"Redis error in rate limiter: {e}")
            return self._is_allowed_memory(identifier)

    def get_ttl(self, identifier: str) -> int:
        """Get remaining TTL for the rate limit window."""
        client = get_redis()
        if client is None:
            return 0

        key = self._get_key(identifier)
        try:
            ttl = client.ttl(key)
            return max(0, ttl)  # type: ignore[type-var]
        except redis.RedisError:
            return 0


class AuthCodeStore:
    """Store authentication codes in Redis with automatic expiration."""

    PREFIX_USER = "authcode:user"
    PREFIX_HUMAN = "authcode:human"
    PREFIX_PENDING = "authcode:pending"

    def __init__(self, expiration_minutes: int = 15, max_attempts: int = 5):
        self.expiration = timedelta(minutes=expiration_minutes)
        self.max_attempts = max_attempts

    def _get_key(self, prefix: str, identifier: str) -> str:
        return f"{prefix}:{identifier}"

    def _get_attempts_key(self, prefix: str, identifier: str) -> str:
        return f"{prefix}:{identifier}:attempts"

    def store_user_code(self, user_id: uuid.UUID, code: str) -> bool:
        """Store auth code for a user."""
        return self._store_code(self.PREFIX_USER, str(user_id), code)

    def store_human_code(
        self, tenant_id: uuid.UUID, email: str, code: str, is_pending: bool = False
    ) -> bool:
        """Store auth code for a human (existing or pending)."""
        prefix = self.PREFIX_PENDING if is_pending else self.PREFIX_HUMAN
        identifier = f"{tenant_id}:{email.lower()}"
        return self._store_code(prefix, identifier, code)

    def _store_code(self, prefix: str, identifier: str, code: str) -> bool:
        """Store an auth code with expiration."""
        client = get_redis()
        if client is None:
            return False

        key = self._get_key(prefix, identifier)
        attempts_key = self._get_attempts_key(prefix, identifier)

        try:
            pipe = client.pipeline()
            pipe.setex(key, self.expiration, code)
            pipe.setex(attempts_key, self.expiration, 0)
            pipe.execute()
            return True
        except redis.RedisError as e:
            logger.warning(f"Failed to store auth code in Redis: {e}")
            return False

    def verify_user_code(self, user_id: uuid.UUID, code: str) -> tuple[bool, str]:
        """Verify auth code for a user."""
        return self._verify_code(self.PREFIX_USER, str(user_id), code)

    def verify_human_code(
        self, tenant_id: uuid.UUID, email: str, code: str, is_pending: bool = False
    ) -> tuple[bool, str]:
        """Verify auth code for a human."""
        prefix = self.PREFIX_PENDING if is_pending else self.PREFIX_HUMAN
        identifier = f"{tenant_id}:{email.lower()}"
        return self._verify_code(prefix, identifier, code)

    def _verify_code(self, prefix: str, identifier: str, code: str) -> tuple[bool, str]:
        """
        Verify an auth code.

        Returns:
            tuple: (is_valid, error_message)
        """
        client = get_redis()
        if client is None:
            return False, "Authentication service unavailable"

        key = self._get_key(prefix, identifier)
        attempts_key = self._get_attempts_key(prefix, identifier)

        try:
            # Check attempts first
            attempts = client.get(attempts_key)
            if attempts is not None and int(attempts) >= self.max_attempts:  # type: ignore[arg-type]
                return (
                    False,
                    "Maximum authentication attempts exceeded. Please request a new code.",
                )

            # Get stored code
            stored_code = client.get(key)
            if stored_code is None:
                return False, "No authentication code pending or code has expired"

            if stored_code != code:
                # Increment attempts
                client.incr(attempts_key)
                return False, "Invalid authentication code"

            # Code is valid, delete it
            pipe = client.pipeline()
            pipe.delete(key)
            pipe.delete(attempts_key)
            pipe.execute()
            return True, ""

        except redis.RedisError as e:
            logger.warning(f"Redis error verifying auth code: {e}")
            return False, "Authentication service error"

    def delete_code(
        self,
        prefix: str,
        identifier: str,
    ) -> None:
        """Delete an auth code (used when creating human from pending)."""
        client = get_redis()
        if client is None:
            return

        key = self._get_key(prefix, identifier)
        attempts_key = self._get_attempts_key(prefix, identifier)

        try:
            client.delete(key, attempts_key)
        except redis.RedisError as e:
            logger.warning(f"Failed to delete auth code: {e}")


class PendingHumanStore:
    """Store pending human data in Redis."""

    PREFIX = "pending_human"

    def __init__(self, expiration_minutes: int = 15):
        self.expiration = timedelta(minutes=expiration_minutes)

    def _get_key(self, tenant_id: uuid.UUID, email: str) -> str:
        return f"{self.PREFIX}:{tenant_id}:{email.lower()}"

    def store(
        self,
        tenant_id: uuid.UUID,
        email: str,
        picture_url: str | None = None,
        red_flag: bool = False,
    ) -> bool:
        """Store pending human data."""
        client = get_redis()
        if client is None:
            return False

        key = self._get_key(tenant_id, email)
        data = {
            "tenant_id": str(tenant_id),
            "email": email.lower(),
            "picture_url": picture_url or "",
            "red_flag": "1" if red_flag else "0",
        }

        try:
            client.hset(key, mapping=data)
            client.expire(key, self.expiration)
            return True
        except redis.RedisError as e:
            logger.warning(f"Failed to store pending human: {e}")
            return False

    def get(self, tenant_id: uuid.UUID, email: str) -> dict | None:
        """Get pending human data."""
        client = get_redis()
        if client is None:
            return None

        key = self._get_key(tenant_id, email)

        try:
            data = client.hgetall(key)
            if not data:
                return None

            # With decode_responses=True, hgetall returns dict[str, str]
            str_data: dict[str, str] = data  # type: ignore[assignment]
            return {
                "tenant_id": uuid.UUID(str_data["tenant_id"]),
                "email": str_data["email"],
                "picture_url": str_data["picture_url"] or None,
                "red_flag": str_data["red_flag"] == "1",
            }
        except (redis.RedisError, KeyError, ValueError) as e:
            logger.warning(f"Failed to get pending human: {e}")
            return None

    def delete(self, tenant_id: uuid.UUID, email: str) -> None:
        """Delete pending human data."""
        client = get_redis()
        if client is None:
            return

        key = self._get_key(tenant_id, email)
        try:
            client.delete(key)
        except redis.RedisError as e:
            logger.warning(f"Failed to delete pending human: {e}")


# Pre-configured rate limiters
login_rate_limiter = RateLimiter(
    prefix="login",
    max_requests=5,
    window_seconds=15 * 60,  # 5 requests per 15 minutes
)

# Auth code store
auth_code_store = AuthCodeStore(expiration_minutes=15, max_attempts=5)

# Pending human store
pending_human_store = PendingHumanStore(expiration_minutes=15)


def is_redis_available() -> bool:
    """Check if Redis is configured and available."""
    return get_redis() is not None


class WebhookCache:
    """Deduplication cache for webhook events.

    Uses Redis if available, otherwise falls back to in-memory dict.
    In-memory fallback is not suitable for multi-instance deployments.
    """

    PREFIX = "webhook"

    def __init__(self, ttl_seconds: int = 3600):
        self.ttl_seconds = ttl_seconds
        self._memory_cache: dict[str, float] = {}

    def _get_key(self, fingerprint: str) -> str:
        return f"{self.PREFIX}:{fingerprint}"

    def add(self, fingerprint: str) -> bool:
        """
        Try to add a fingerprint to the cache.

        Returns True if fingerprint was added (not seen before).
        Returns False if fingerprint already exists (duplicate).
        """
        client = get_redis()

        if client is not None:
            return self._add_redis(client, fingerprint)
        return self._add_memory(fingerprint)

    def _add_redis(self, client: redis.Redis, fingerprint: str) -> bool:
        """Add fingerprint to Redis cache."""
        key = self._get_key(fingerprint)
        try:
            # SETNX returns True if key was set, False if it already existed
            was_set = client.setnx(key, "1")
            if was_set:
                client.expire(key, self.ttl_seconds)
            return bool(was_set)
        except redis.RedisError as e:
            logger.warning(f"Redis error in webhook cache: {e}")
            # On Redis error, allow processing (fail open)
            return True

    def _add_memory(self, fingerprint: str) -> bool:
        """Add fingerprint to in-memory cache (fallback)."""
        import time

        now = time.time()

        # Clean expired entries periodically
        self._cleanup_memory(now)

        if fingerprint in self._memory_cache:
            return False

        self._memory_cache[fingerprint] = now + self.ttl_seconds
        return True

    def _cleanup_memory(self, now: float) -> None:
        """Remove expired entries from memory cache."""
        expired = [k for k, v in self._memory_cache.items() if v < now]
        for k in expired:
            del self._memory_cache[k]


# Webhook deduplication cache
webhook_cache = WebhookCache(ttl_seconds=3600)
