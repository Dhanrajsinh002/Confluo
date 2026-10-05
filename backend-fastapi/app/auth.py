from jose import jwt, JWTError
from .config import JWT_SECRET, JWT_ALGORITHM

def verify_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
