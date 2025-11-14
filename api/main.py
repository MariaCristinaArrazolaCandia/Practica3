from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from routes import user, upload, status, data
from typing import List


app = FastAPI(
    title="API de Monitoreo GAMC",
    description="API para la gestión de usuarios y datos del sistema de monitoreo.",
    version="1.0.0"
)

# Orígenes permitidos para CORS. En producción, deberías ser más restrictivo.
origins = [
    "http://localhost:3000",  # El origen de tu frontend de React
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todas las cabeceras
)

# --- GESTIÓN DE WEBSOCKETS PARA NOTIFICACIONES EN TIEMPO REAL ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Mantenemos la conexión abierta. En una app real, aquí se podría
            # manejar la comunicación bidireccional.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- INCLUSIÓN DE RUTAS ---
app.include_router(user.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(status.router, prefix="/api")
app.include_router(data.router, prefix="/api")