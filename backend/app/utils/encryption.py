import base64
import hashlib
from functools import lru_cache

from cryptography.fernet import Fernet

from app.core.config import settings


def _get_fernet_key() -> bytes:
    key_bytes = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    return base64.urlsafe_b64encode(key_bytes)


@lru_cache(maxsize=1)
def _get_fernet() -> Fernet:
    return Fernet(_get_fernet_key())


def encrypt(plaintext: str) -> str:
    fernet = _get_fernet()
    encrypted = fernet.encrypt(plaintext.encode())
    return encrypted.decode()


def decrypt(ciphertext: str) -> str:
    fernet = _get_fernet()
    decrypted = fernet.decrypt(ciphertext.encode())
    return decrypted.decode()
