from fastapi import FastAPI
from routes import upload, status, data 

app = FastAPI(
    title="ETL API",
    description="Backend FastAPI para subir CSV y disparar tareas ETL",
    version="1.0.0",
)

# Ruta de salud básica
@app.get("/")
def health():
    return {"status": "ok", "message": "backend funcionando"}

# Montar el router donde está /upload
app.include_router(upload.router, prefix="/api")

# Nuevo endpoint de status
app.include_router(status.router, prefix="/api")
