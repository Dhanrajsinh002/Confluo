from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from .connection_manager import manager
from .auth import verify_token

router = APIRouter()

@router.websocket("/ws/{document_id}")
async def document_socket(websocket: WebSocket, document_id: str, token: str = Query(...)):
    payload = verify_token(token)
    if payload is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = payload.get("user_id")
    await manager.connect(document_id, websocket)

    try:
        while True:
            data = await websocket.receive()
            await manager.broadcast(document_id, data, sender=websocket)
    except WebSocketDisconnect:
        manager.disconnect(document_id, websocket)
