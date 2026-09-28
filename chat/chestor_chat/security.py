import base64
import hashlib
import hmac
import secrets
from dataclasses import dataclass


def hash_ip(ip: str, salt: str) -> str:
    return hashlib.sha256(f"{salt}:{ip}".encode()).hexdigest()[:32]


@dataclass(frozen=True)
class Pass:
    pass_id: str
    expires_at: int
    token: str


# Пропуск капчи — `id.expires.hmac`: сервер ничего не хранит, подделать без секрета нельзя.
class PassSigner:
    def __init__(self, secret: str) -> None:
        self._key = secret.encode()

    def _sign(self, payload: str) -> str:
        digest = hmac.new(self._key, payload.encode(), hashlib.sha256).digest()
        return base64.urlsafe_b64encode(digest).rstrip(b"=").decode()

    def issue(self, now: float, ttl: int) -> Pass:
        pass_id = secrets.token_urlsafe(12)
        expires_at = int(now) + ttl
        payload = f"{pass_id}.{expires_at}"
        return Pass(
            pass_id=pass_id, expires_at=expires_at, token=f"{payload}.{self._sign(payload)}"
        )

    def verify(self, token: str | None, now: float) -> Pass | None:
        if not token or token.count(".") != 2:
            return None
        pass_id, expires_raw, signature = token.split(".")
        if not expires_raw.isdigit():
            return None
        if not hmac.compare_digest(signature, self._sign(f"{pass_id}.{expires_raw}")):
            return None
        expires_at = int(expires_raw)
        if expires_at <= now:
            return None
        return Pass(pass_id=pass_id, expires_at=expires_at, token=token)
