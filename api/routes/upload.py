import os
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from celery import Celery

router = APIRouter(tags=["upload"])

# Celery broker: rabbitmq es el nombre del servicio en docker-compose
celery_app = Celery(
    "backend_producer",
    broker="amqp://guest:guest@rabbitmq:5672//",
    backend=None
)

# Ruta absoluta dentro del contenedor backend
# /app/data viene del volumen:
#   - ./data:/app/data   en docker-compose
DATA_DIR = "/app/data"
INBOUND_DIR = os.path.join(DATA_DIR, "inbound")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")

# asegurarnos que existan las carpetas
os.makedirs(INBOUND_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    # validar extensión
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos .csv")

    # nombre único
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    saved_name = f"{timestamp}_{file.filename}"
    full_path = os.path.join(INBOUND_DIR, saved_name)

    # guardar físicamente el archivo subido
    content = await file.read()
    with open(full_path, "wb") as f:
        f.write(content)

    # mandar tarea Celery al worker
    task = celery_app.send_task(
        "worker.tasks.procesar_csv",  # nombre EXACTO de la tarea en worker/tasks.py
        args=[full_path]
    )

    return JSONResponse({
        "message": "Archivo recibido y tarea enviada al worker.",
        "saved_as": saved_name,
        "full_path": full_path,
        "task_id": task.id
    })
