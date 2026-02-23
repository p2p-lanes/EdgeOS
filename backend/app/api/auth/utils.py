import secrets
from datetime import UTC, datetime, timedelta


def generate_auth_code() -> str:
    """
    Generate a secure 6-digit authentication code.

    Returns:
        6-digit string code
    """
    return "".join([str(secrets.randbelow(10)) for _ in range(6)])


def create_code_expiration(minutes: int = 15) -> datetime:
    """
    Create an expiration datetime for auth codes.

    Args:
        minutes: Number of minutes until expiration (default: 15)

    Returns:
        Datetime when the code should expire
    """
    return datetime.now(UTC) + timedelta(minutes=minutes)


def is_code_expired(expiration: datetime) -> bool:
    """
    Check if an auth code has expired.

    Args:
        expiration: The expiration datetime

    Returns:
        True if code is expired, False otherwise
    """
    now = datetime.now(UTC)
    expiration = expiration.replace(tzinfo=UTC)
    return now > expiration


def is_code_valid(
    stored_code: str,
    provided_code: str,
    expiration: datetime,
) -> tuple[bool, str | None]:
    """
    Validate an authentication code.

    Args:
        stored_code: The code stored in the database
        provided_code: The code provided by the user
        expiration: The code expiration datetime

    Returns:
        Tuple of (is_valid, error_message)
        - (True, None) if code is valid
        - (False, error_message) if code is invalid
    """
    # Check if code is expired
    if is_code_expired(expiration):
        return False, "Code has expired"

    # Check if codes match
    if stored_code != provided_code:
        return False, "Invalid code"

    return True, None
