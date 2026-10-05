from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.ws_routes import router as ws_router

app = FastAPI(title="Confluo Realtime Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ws_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
