import os
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from celery import Celery
from routes.ws import manager # importar el manager de conexiones WebSocket


router = APIRouter(tags=["upload"])

celery_app = Celery(
    "backend_producer",
    broker="amqp://guest:guest@rabbitmq:5672//",
    backend="rpc://"
)

# Ambas containers (backend y worker) montan ./data -> /data
DATA_DIR = "/data"
INBOUND_DIR = os.path.join(DATA_DIR, "inbound")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")



os.makedirs(INBOUND_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Solo se aceptan archivos .csv")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    saved_name = f"{timestamp}_{file.filename}"
    full_path = os.path.join(INBOUND_DIR, saved_name)

    # guardar el archivo en /data/inbound
    raw_bytes = await file.read()
    with open(full_path, "wb") as f:
        f.write(raw_bytes)

    # mandar la ruta EXACTA que el worker también puede ver
    task = celery_app.send_task(
        "worker.tasks.procesar_csv",
        args=[full_path]   # <-- /data/inbound/loquesea.csv
    )
    
    await manager.broadcast(f"Nuevo CSV cargado: {file.filename}")

    return JSONResponse({
        "message": "Archivo recibido y tarea enviada al worker.",
        "saved_as": saved_name,
        "path": full_path,
        "task_id": task.id
    })
