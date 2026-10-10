from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, document_id: str, websocket: WebSocket):
        await websocket.accept()
        self.rooms.setdefault(document_id, []).append(websocket)

    def disconnect(self, document_id: str, websocket: WebSocket):
        room = self.rooms.get(document_id)
        if room and websocket in room:
            room.remove(websocket)
            if not room:
                del self.rooms[document_id]

    async def broadcast(self, document_id: str, message: bytes, sender: WebSocket):
        for connection in list(self.rooms.get(document_id, [])):
            if connection is sender:
                continue
            try:
                await connection.send_bytes(message)
            except Exception:
                self.disconnect(document_id, connection)


manager = ConnectionManager()
