from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception:
                # si falla, la sacamos de la lista
                self.disconnect(connection)


# 👇 ESTA es la instancia que usarán otros módulos
manager = ConnectionManager()


@router.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket):
    """
    WebSocket básico:
    - URL: ws://localhost:8070/ws/notifications
    - Por ahora solo hace echo de lo que recibe.
    """
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # echo simple
            await websocket.send_text(f"Echo desde backend: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
