import os
import pandas as pd
from celery import Celery
from datetime import datetime
import mysql.connector
from mysql.connector import Error
from pymongo import MongoClient

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

def mysql_log_upload(filename: str, rows_in: int, processed_at: datetime):
    """
    Inserta un registro en MySQL.upload_logs
    """
    try:
        conn = mysql.connector.connect(
            host="mysql",
            port=3306,
            user="root",
            password="root123",
            database="etl_system"
        )
    except Error as e:
        print("Error conectando a MySQL desde worker:", e)
        return

    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS upload_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255),
                rows_in INT,
                processed_at DATETIME
            )
        """)
        conn.commit()

        cursor.execute(
            "INSERT INTO upload_logs (filename, rows_in, processed_at) VALUES (%s, %s, %s)",
            (filename, rows_in, processed_at)
        )
        conn.commit()
    finally:
        conn.close()


def mongo_log_upload(filename: str, rows_in: int, output_file: str):
    """
    Inserta metadatos en Mongo uploads
    """
    client = MongoClient("mongodb://mongo:27017")
    db = client["etl_system"]
    coll = db["uploads"]
    coll.insert_one({
        "filename": filename,
        "rows_in": rows_in,
        "output_file": output_file,
        "logged_at": datetime.now().isoformat()
    })


@celery_app.task(name="worker.tasks.procesar_csv")
def procesar_csv(csv_path: str):
    """
    Procesa el CSV y escribe resultado en /data/processed/...
    También guarda trazabilidad en MySQL y Mongo.
    """
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

    # transformación de ejemplo
    processed_at = datetime.now()
    df["processed_at"] = processed_at.isoformat()

    base_name = os.path.basename(csv_path)
    out_path = os.path.join(PROCESSED_DIR, f"processed_{base_name}")
    df.to_csv(out_path, index=False)

    rows_in = len(df)

    # LOG a MySQL
    mysql_log_upload(
        filename=base_name,
        rows_in=rows_in,
        processed_at=processed_at
    )

    # LOG a Mongo
    mongo_log_upload(
        filename=base_name,
        rows_in=rows_in,
        output_file=out_path
    )

    return {
        "status": "ok",
        "rows_in": rows_in,
        "output_file": out_path
    }