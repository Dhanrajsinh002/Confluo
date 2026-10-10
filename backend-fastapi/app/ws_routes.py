import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from .auth import verify_token, TokenError
from .connection_manager import manager

logger = logging.getLogger("confluo.ws")
router = APIRouter()

WS_UNSUPPORTED_DATA = 1003   # standard: client sent a frame type we don't accept
WS_INTERNAL_ERROR = 1011     # standard: unexpected server error
WS_UNAUTHORIZED = 4401       # custom: missing, invalid or expired token

async def close_quietly(websocket: WebSocket, code: int, reason: str):
    try:
        await websocket.close(code=code, reason=reason)
    except Exception:
        pass  # already closed

@router.websocket("/ws/{document_id}")
async def document_socket(websocket: WebSocket, document_id: str, token: str = Query(default="")):
    try:
        payload = verify_token(token)
    except TokenError as e:
        logger.warning("Rejected connection to doc=%s: %s", document_id, e.reason)
        await websocket.accept()  # accept first, otherwise the browser never sees our close code
        await close_quietly(websocket, WS_UNAUTHORIZED, e.reason)
        return

    await manager.connect(document_id, websocket)
    logger.info("user=%s joined doc=%s", payload.get("user_id"), document_id)

    try:
        while True:
            message = await websocket.receive()
            if message["type"] == "websocket.disconnect":
                break
            data = message.get("bytes")
            if data is None:
                await close_quietly(websocket, WS_UNSUPPORTED_DATA, "Binary frames only")
                break
            await manager.broadcast(document_id, data, sender=websocket)
    except Exception:
        logger.exception("Unexpected error in doc=%s", document_id)
        await close_quietly(websocket, WS_INTERNAL_ERROR, "Internal server error")
    finally:
        manager.disconnect(document_id, websocket)
        logger.info("user=%s left doc=%s", payload.get("user_id"), document_id)
