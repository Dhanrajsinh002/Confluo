import logging
from jose import jwt, JWTError
from jose.exceptions import ExpiredSignatureError
from .config import JWT_SECRET, JWT_ALGORITHM

logger = logging.getLogger("confluo.auth")

class TokenError(Exception):
    def __init__(self, reason: str):
        super().__init__(reason)
        self.reason = reason

def verify_token(token: str) -> dict:
    if not token:
        raise TokenError("Missing token")

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        if payload.get("token_type") != "access":  # a refresh token must not open a socket
                raise TokenError("Wrong token type")

        return payload
    except ExpiredSignatureError:
        raise TokenError("Token expired")
    except JWTError:
        raise TokenError("Invalid token")
