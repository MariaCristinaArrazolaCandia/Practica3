from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import user, upload, status, data, ws

app = FastAPI(
    title="API de Monitoreo GAMC",
    description="API para la gestión de usuarios y datos del sistema de monitoreo.",
    version="1.0.0"
)


# Orígenes permitidos para CORS. En producción, deberías ser más restrictivo.
origins = [
    "http://localhost:3000",  # El origen de tu frontend de React
    "http://127.0.0.1:3000",
]



app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # o ["*"] para pruebas
    allow_credentials=True,
    allow_methods=["*"],          # permite GET, POST, PUT, etc.
    allow_headers=["*"],          # permite cualquier header (Content-Type, Authorization, etc.)
)
@app.get("/")
def root():
    return {"status": "ok", "message": "Backend Monitoreo GAMC funcionando"}


# Incluir el router de usuarios con el prefijo /api
# Esto hará que la ruta /users/login esté disponible en /api/users/login
app.include_router(user.router, prefix="/api")
# Montar el router donde está /upload
app.include_router(upload.router, prefix="/api")
# Nuevo endpoint de status
app.include_router(status.router, prefix="/api")
# Nuevo endpoint de data
app.include_router(data.router, prefix="/api")


# Rutas WebSocket (sin /api, van directo desde la raíz)
app.include_router(ws.router)