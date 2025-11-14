import os
import pandas as pd
from celery import Celery
from datetime import datetime
import mysql.connector
from mysql.connector import Error
from pymongo import MongoClient
import json
import numpy as np

celery_app = Celery(
    "etl_worker",
    broker="amqp://guest:guest@rabbitmq:5672//",
    backend="rpc://"  # <-- IMPORTANTE: Añadir backend para que se puedan consultar los resultados
)

DATA_DIR = "/data"
INBOUND_DIR = os.path.join(DATA_DIR, "inbound")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")

os.makedirs(INBOUND_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

# --- Conexiones a Bases de Datos (se crean una vez por worker) ---

def get_mysql_conn():
    """
    Devuelve una conexión viva a MySQL.
    Se reintentará la conexión si falla inicialmente.
    """
    try:
        return mysql.connector.connect(
            host="mysql",
            port=3306,
            user="root",
            password="root123",
            database="etl_system"
        )
    except Error as e:
        print("Error conectando a MySQL desde worker:", e)
        return None

mysql_conn = get_mysql_conn()
mongo_client = MongoClient("mongodb://mongo:27017")
mongo_db = mongo_client["EMERGENTES_Monitoreo_GAMC"] # Base de datos principal


def log_summary_to_mongo(summary: dict):
    """
    Inserta un documento de resumen del proceso en MongoDB.
    """
    summary_collection = mongo_db["processing_summaries"]
    summary_collection.insert_one(summary)

# --- FUNCIONES DE PROCESAMIENTO (ETL) ---

def get_value(row, key, default=None):
    """Obtiene un valor de la fila de forma segura, manejando NaN y errores."""
    try:
        val = row.get(key)
        if pd.isna(val) or val is None:
            return default
        # Convertir tipos de numpy a tipos nativos de Python
        if isinstance(val, np.generic):
            return val.item()
        return val
    except KeyError:
        return default

def process_row(cursor, row, sensor_type):
    """Procesa una única fila del DataFrame y la inserta en las tablas de MySQL."""
    
    # 1. Extraer y transformar datos del dispositivo (UPSERT)
    dev_eui = get_value(row, 'deviceInfo.devEui')
    if not dev_eui:
        return "skipped_no_dev_eui"

    device_name = get_value(row, 'deviceInfo.deviceName', 'N/A')
    location_str = get_value(row, 'deviceInfo.tags.Location', '0,0')
    try:
        lat, lon = map(float, location_str.split(','))
        location_sql = f"POINT({lon}, {lat})"
    except (ValueError, IndexError):
        location_sql = "NULL"

    # Usamos INSERT ... ON DUPLICATE KEY UPDATE para la idempotencia en `devices`
    upsert_device_sql = f"""
        INSERT INTO devices (id, devEui, deviceName, deviceProfileName, tenantName, applicationName, description, address, location)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, ST_PointFromText(%s))
        ON DUPLICATE KEY UPDATE
            deviceName = VALUES(deviceName),
            deviceProfileName = VALUES(deviceProfileName),
            address = VALUES(address);
    """
    cursor.execute(upsert_device_sql, (
        dev_eui, dev_eui, device_name,
        get_value(row, 'deviceInfo.deviceProfileName'),
        get_value(row, 'deviceInfo.tenantName'),
        get_value(row, 'deviceInfo.applicationName'),
        get_value(row, 'deviceInfo.tags.Description'),
        get_value(row, 'deviceInfo.tags.Address'),
        f'POINT({lon} {lat})' if location_sql != "NULL" else None
    ))

    # 2. Insertar en la tabla `measurements`
    insert_measurement_sql = """
        INSERT INTO measurements (device_id, measurement_time, fcnt, fport, dr, adr, confirmed, raw_data_hex)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(insert_measurement_sql, (
        dev_eui,
        pd.to_datetime(get_value(row, 'time')),
        get_value(row, 'fCnt', 0),
        get_value(row, 'fPort', 0),
        get_value(row, 'dr', 0),
        get_value(row, 'adr', False),
        get_value(row, 'confirmed', False),
        get_value(row, 'data')
    ))
    measurement_id = cursor.lastrowid

    # 3. Insertar en la tabla específica del sensor
    if sensor_type == 'calidad_aire':
        sql = """
            INSERT INTO air_quality_measurements (measurement_id, temperature, humidity, pressure, data, battery)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        # Extraer el objeto y convertirlo a JSON si existe
        object_data = {k.replace('object.', ''): v for k, v in row.items() if k.startswith('object.') and pd.notna(v)}
        cursor.execute(sql, (
            measurement_id,
            get_value(row, 'object.temperature'),
            get_value(row, 'object.humidity'),
            get_value(row, 'object.pressure'),
            json.dumps(object_data) if object_data else None,
            get_value(row, 'object.battery') or get_value(row, 'batteryLevel')
        ))
    elif sensor_type == 'sonido':
        sql = """
            INSERT INTO sound_measurements (measurement_id, laeq, lai, laiMax, battery, status)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            measurement_id,
            get_value(row, 'object.LAeq'),
            get_value(row, 'object.LAI'),
            get_value(row, 'object.LAImax'),
            get_value(row, 'object.battery') or get_value(row, 'batteryLevel'),
            get_value(row, 'object.status')
        ))
    elif sensor_type == 'soterrado':
        sql = """
            INSERT INTO buried_measurements (measurement_id, distance_cm, status, battery)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql, (
            measurement_id,
            get_value(row, 'object.distance'),
            get_value(row, 'object.status'),
            get_value(row, 'object.battery') or get_value(row, 'batteryLevel')
        ))
    
    return "inserted"


@celery_app.task(name="worker.tasks.procesar_csv")
def procesar_csv(csv_path: str, sensor_type: str):
    """
    Pipeline ETL para procesar un archivo CSV y guardar los datos de forma
    normalizada en MySQL.
    """
    if not os.path.exists(csv_path):
        return {
            "status": "error",
            "message": f"El archivo {csv_path} no fue encontrado en el worker."
        }

    # leer CSV
    try:
        # Usamos on_bad_lines='warn' para no detener el proceso por una línea malformada
        df = pd.read_csv(csv_path, on_bad_lines='warn')
        # Reemplazar valores infinitos que pueden causar problemas en JSON/DB
        df.replace([np.inf, -np.inf], np.nan, inplace=True)
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error al leer el archivo CSV: {e}"
        }

    processed_at = datetime.now()
    rows_in = len(df)
    base_name = os.path.basename(csv_path)
    rows_inserted = 0
    rows_skipped_no_eui = 0
    errors = []

    if not mysql_conn:
        raise ConnectionError("No se pudo conectar a MySQL para procesar los datos.")

    cursor = mysql_conn.cursor()

    try:
        for index, row in df.iterrows():
            try:
                result = process_row(cursor, row, sensor_type)
                if result == "inserted":
                    rows_inserted += 1
                elif result == "skipped_no_dev_eui":
                    rows_skipped_no_eui += 1
            except Error as e:
                # Si una fila falla, la registramos y continuamos
                errors.append(f"Fila {index}: {e}")
                mysql_conn.rollback() # Revertimos la transacción de la fila fallida
            else:
                mysql_conn.commit() # Confirmamos la transacción de la fila exitosa
    finally:
        cursor.close()

    # --- Registro y Trazabilidad ---
    summary = {
        "processed_at": processed_at,
        "source_file": base_name,
        "sensor_type": sensor_type,
        "rows_in_file": rows_in,
        "rows_processed_successfully": rows_inserted,
        "rows_skipped_no_dev_eui": rows_skipped_no_eui,
        "row_errors": len(errors),
        "error_details": errors[:10] # Guardamos solo los primeros 10 errores para no sobrecargar el log
    }
    log_summary_to_mongo(summary)

    return {
        "status": "ok",
        "message": f"Proceso completado para {base_name}. Insertados: {rows_inserted}, Errores: {len(errors)}.",
        "summary": summary
    }