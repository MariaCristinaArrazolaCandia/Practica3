import os
import pandas as pd
from celery import Celery
from datetime import datetime

celery_app = Celery(
    "etl_worker",
    broker="amqp://guest:guest@rabbitmq:5672//",
    backend=None
)

DATA_DIR = "/data"
INBOUND_DIR = os.path.join(DATA_DIR, "inbound")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")

os.makedirs(INBOUND_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

@celery_app.task(name="worker.tasks.procesar_csv")
def procesar_csv(csv_path: str):
    # csv_path debería venir como /data/inbound/loquesea.csv
    if not os.path.exists(csv_path):
        return {
            "status": "error",
            "detail": f"no existe {csv_path}"
        }

    # leer CSV
    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        return {
            "status": "error",
            "detail": f"Error leyendo CSV: {e}"
        }

    # ejemplo de transformación
    df["processed_at"] = datetime.now().isoformat()

    base_name = os.path.basename(csv_path)
    out_path = os.path.join(PROCESSED_DIR, f"processed_{base_name}")
    df.to_csv(out_path, index=False)

    return {
        "status": "ok",
        "rows_in": len(df),
        "output_file": out_path
    }
