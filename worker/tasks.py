import os
import pandas as pd
from celery import Celery

# La misma config de Celery, pero ahora este es el lado consumidor (worker)
celery_app = Celery(
    "etl_worker",
    broker="amqp://guest:guest@rabbitmq:5672//",
    backend=None
)

@celery_app.task(name="worker.tasks.procesar_csv")
def procesar_csv(csv_path: str):
    """
    Lee un CSV que subió el backend, lo procesa,
    y lo deja en data/processed.
    """
    if not os.path.exists(csv_path):
        # si el archivo ya no existe, avisamos
        return {"status": "error", "detail": f"no existe {csv_path}"}

    # leer CSV con pandas
    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        return {"status": "error", "detail": f"Error leyendo CSV: {e}"}

    # ==== Aquí haces tu lógica ETL real ====
    # Ejemplo tonto: agregar una columna "processed_at"
    from datetime import datetime
    df["processed_at"] = datetime.now().isoformat()

    # Guardar versión procesada
    processed_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "processed"))
    os.makedirs(processed_dir, exist_ok=True)

    base_name = os.path.basename(csv_path)
    out_path = os.path.join(processed_dir, f"processed_{base_name}")
    df.to_csv(out_path, index=False)

    return {
        "status": "ok",
        "rows_in": len(df),
        "output_file": out_path
    }
