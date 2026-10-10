import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
REDIS_URL = os.getenv("REDIS_URL", "http://localhost:6379")

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is not set. Create backend-fastapi/.env (see .env.example).")
