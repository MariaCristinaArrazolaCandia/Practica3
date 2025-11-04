from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import user, upload, status, data 

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

# Incluir el router de usuarios con el prefijo /api
# Esto hará que la ruta /users/login esté disponible en /api/users/login
app.include_router(user.router, prefix="/api")

# Montar el router donde está /upload
app.include_router(upload.router, prefix="/api")

# Nuevo endpoint de status
app.include_router(status.router, prefix="/api")



# Nuevo endpoint de data
app.include_router(data.router, prefix="/api")
