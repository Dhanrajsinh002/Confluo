from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, document_id: str, websocket: WebSocket):
        await websocket.accept()
        self.rooms.setdefault(document_id, []).append(websocket)

    def disconnect(self, document_id: str, websocket: WebSocket):
        if document_id in self.rooms:
            self.rooms[document_id].remove(websocket)
            if not self.rooms[document_id]:
                del self.rooms[document_id]

    async def broadcast(self, document_id: str, message: bytes, sender: WebSocket):
        """Send a message to everyone in the room except the sender."""
        for connection in self.rooms[document_id, []]:
            if connection != sender:
                await connection.send_bytes(message)

manager = ConnectionManager()