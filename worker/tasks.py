import os
import pandas as pd
from celery import Celery
import csv
from datetime import datetime
import mysql.connector
from mysql.connector import Error
from db_mysql import get_mysql_conn
from pymongo import MongoClient

celery_app = Celery(
    "etl_worker",
    broker="amqp://guest:guest@rabbitmq:5672//",
    backend="rpc://"
)

DATA_DIR = "/data"
INBOUND_DIR = os.path.join(DATA_DIR, "inbound")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")

os.makedirs(INBOUND_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

# -------------------------------
# Conexión MySQL (sensor_monitoring)
# -------------------------------
MYSQL_HOST = os.getenv("MYSQL_HOST", "mysql")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "admin")
MYSQL_DB = os.getenv("MYSQL_DB", "sensor_monitoring")


def get_mysql_conn():
    return mysql.connector.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
    )


# -------------------------------
# Conexión Mongo (para logs de uploads)
# -------------------------------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017")
mongo_client = MongoClient(MONGO_URI)

etl_db = mongo_client["etl_system"]
uploads_collection = etl_db["uploads"]


# -------------------------------
# Helpers de parsing
# -------------------------------
def parse_bool(value):
    if value is None:
        return None
    v = str(value).strip().lower()
    if v in ("1", "true", "yes", "y", "t"):
        return True
    if v in ("0", "false", "no", "n", "f"):
        return False
    return None


def parse_datetime(value):
    """
    Ajusta este parser al formato EXACTO de 'Time' en tu CSV.
    Ejemplos típicos:
      - 2025-11-10T12:34:56Z
      - 2025-11-10 12:34:56
    """
    if not value:
        return None
    v = value.strip()
    if v.endswith("Z"):
        v = v[:-1]
    v = v.replace("T", " ")
    try:
        return datetime.fromisoformat(v)
    except Exception:
        # Dejarlo como string y que MySQL lo intente interpretar
        return v


def parse_location(location_str):
    """
    Deviceinfo.tag.location: Latitud y longitud del sensor.
    Suponemos formato "lat,lon" (ej: "-17.3895,-66.1568").
    """
    if not location_str:
        return None, None
    try:
        parts = [p.strip() for p in str(location_str).split(",")]
        if len(parts) != 2:
            return None, None
        lat = float(parts[0])
        lon = float(parts[1])
        return lat, lon
    except Exception:
        return None, None


# -------------------------------
# Tarea principal: procesar CSV
# -------------------------------
@celery_app.task(name="worker.tasks.procesar_csv")
def procesar_csv(path_csv: str) -> dict:
    """
    Procesa un CSV con columnas como:
      Id, devAddr, deduplicationId, Time,
      deviceInfo.classEnabled, deviceinfo.tenantName, deviceinfo.deviceName,
      deviceinfo.applicatioName, deviceinfo.devEui,
      deviceInfo.deviceProfileName,
      deviceInfo.Tag.description, deviceInfo.Tag.Address, Deviceinfo.tag.location,
      Txinfo, Fport, Data, fcnt, Confirmed, Adr, dr,
      Object.laeq, Object.lai, Object.laiMax, Object.Battery, Object.status

    y las inserta de forma idempotente en:
      - devices
      - measurements
      - sound_measurements
    en la BD sensor_monitoring.

    Además registra un resumen en MongoDB (etl_system.uploads).
    """

    processed = 0
    inserted_devices = 0
    updated_devices = 0
    inserted_measurements = 0
    updated_measurements = 0
    sound_rows = 0
    errors = 0

    start_time = datetime.utcnow()

    print(f"[worker] Iniciando procesamiento de CSV: {path_csv}")

    conn = None
    cursor = None

    try:
        conn = get_mysql_conn()
        cursor = conn.cursor()

        with open(path_csv, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            for row in reader:
                processed += 1
                try:
                    # ---------- 1) DISPOSITIVO ----------
                    dev_eui = (
                        row.get("deviceinfo.devEui")
                        or row.get("deviceInfo.devEui")
                        or row.get("deviceInfo.devEUI")
                    )
                    if not dev_eui:
                        raise Exception("No se encontró deviceinfo.devEui en la fila")

                    device_id = dev_eui  # usamos devEui como PK de devices.id

                    device_name = (
                        row.get("deviceinfo.deviceName")
                        or row.get("deviceInfo.deviceName")
                    )
                    device_profile_name = row.get("deviceInfo.deviceProfileName")
                    tenant_name = (
                        row.get("deviceinfo.tenantName")
                        or row.get("deviceInfo.tenantName")
                    )
                    application_name = row.get("deviceinfo.applicatioName")
                    description = row.get("deviceInfo.Tag.description")
                    address = row.get("deviceInfo.Tag.Address")
                    class_enabled = row.get("deviceInfo.classEnabled")

                    loc_str = (
                        row.get("Deviceinfo.tag.location")
                        or row.get("deviceInfo.tag.location")
                        or row.get("deviceinfo.tag.location")
                    )
                    lat, lon = parse_location(loc_str)

                    if lat is not None and lon is not None:
                        insert_device_sql = """
                            INSERT INTO devices (
                                id, devEui, deviceName, deviceProfileName,
                                tenantName, applicationName, description,
                                address, location, classEnabled
                            )
                            VALUES (
                                %(id)s, %(devEui)s, %(deviceName)s, %(deviceProfileName)s,
                                %(tenantName)s, %(applicationName)s, %(description)s,
                                %(address)s, ST_GeomFromText(%(wkt)s), %(classEnabled)s
                            )
                            ON DUPLICATE KEY UPDATE
                                devEui = VALUES(devEui),
                                deviceName = VALUES(deviceName),
                                deviceProfileName = VALUES(deviceProfileName),
                                tenantName = VALUES(tenantName),
                                applicationName = VALUES(applicationName),
                                description = VALUES(description),
                                address = VALUES(address),
                                location = VALUES(location),
                                classEnabled = VALUES(classEnabled)
                        """
                        wkt = f"POINT({lon} {lat})"
                        params_device = {
                            "id": device_id,
                            "devEui": dev_eui,
                            "deviceName": device_name,
                            "deviceProfileName": device_profile_name,
                            "tenantName": tenant_name,
                            "applicationName": application_name,
                            "description": description,
                            "address": address,
                            "classEnabled": class_enabled,
                            "wkt": wkt,
                        }
                    else:
                        insert_device_sql = """
                            INSERT INTO devices (
                                id, devEui, deviceName, deviceProfileName,
                                tenantName, applicationName, description,
                                address, location, classEnabled
                            )
                            VALUES (
                                %(id)s, %(devEui)s, %(deviceName)s, %(deviceProfileName)s,
                                %(tenantName)s, %(applicationName)s, %(description)s,
                                %(address)s, NULL, %(classEnabled)s
                            )
                            ON DUPLICATE KEY UPDATE
                                devEui = VALUES(devEui),
                                deviceName = VALUES(deviceName),
                                deviceProfileName = VALUES(deviceProfileName),
                                tenantName = VALUES(tenantName),
                                applicationName = VALUES(applicationName),
                                description = VALUES(description),
                                address = VALUES(address),
                                classEnabled = VALUES(classEnabled)
                        """
                        params_device = {
                            "id": device_id,
                            "devEui": dev_eui,
                            "deviceName": device_name,
                            "deviceProfileName": device_profile_name,
                            "tenantName": tenant_name,
                            "applicationName": application_name,
                            "description": description,
                            "address": address,
                            "classEnabled": class_enabled,
                        }

                    cursor.execute(insert_device_sql, params_device)
                    if cursor.rowcount == 1:
                        inserted_devices += 1
                    else:
                        updated_devices += 1

                    # ---------- 2) MEDICIÓN GENERAL (idempotencia por deduplicationId) ----------
                    deduplication_id = row.get("deduplicationId")
                    time_raw = row.get("Time")
                    measurement_dt = parse_datetime(time_raw)

                    fcnt = row.get("fcnt")
                    fcnt = int(fcnt) if fcnt not in (None, "") else None

                    fport = row.get("Fport")
                    fport = int(fport) if fport not in (None, "") else None

                    dr = row.get("dr")
                    dr = int(dr) if dr not in (None, "") else None

                    adr = parse_bool(row.get("Adr"))
                    confirmed = parse_bool(row.get("Confirmed"))
                    raw_data = row.get("Data")

                    insert_meas_sql = """
                        INSERT INTO measurements (
                            device_id, measurement_time,
                            fcnt, fport, dr, adr, confirmed, raw_data,
                            deduplication_id
                        )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                            fport = VALUES(fport),
                            dr = VALUES(dr),
                            adr = VALUES(adr),
                            confirmed = VALUES(confirmed),
                            raw_data = VALUES(raw_data)
                    """

                    cursor.execute(
                        insert_meas_sql,
                        (
                            device_id,
                            measurement_dt,
                            fcnt,
                            fport,
                            dr,
                            adr,
                            confirmed,
                            raw_data,
                            deduplication_id,
                        ),
                    )

                    if cursor.rowcount == 1:
                        inserted_measurements += 1
                    else:
                        updated_measurements += 1

                    # Obtener measurement_id
                    if deduplication_id:
                        cursor.execute(
                            "SELECT id FROM measurements WHERE deduplication_id = %s",
                            (deduplication_id,),
                        )
                    else:
                        cursor.execute(
                            """
                            SELECT id FROM measurements
                            WHERE device_id = %s AND measurement_time = %s
                                  AND (fcnt = %s OR (%s IS NULL AND fcnt IS NULL))
                            """,
                            (device_id, measurement_dt, fcnt, fcnt),
                        )

                    row_meas = cursor.fetchone()
                    if not row_meas:
                        raise Exception("No se encontró measurement_id tras insertar/actualizar")
                    measurement_id = row_meas[0]

                    # ---------- 3) SONIDO (sound_measurements) ----------
                    laeq = row.get("Object.laeq")
                    laeq = float(laeq) if laeq not in (None, "") else None

                    lai = row.get("Object.lai")
                    lai = float(lai) if lai not in (None, "") else None

                    laiMax = row.get("Object.laiMax")
                    laiMax = float(laiMax) if laiMax not in (None, "") else None

                    battery = row.get("Object.Battery")
                    battery = float(battery) if battery not in (None, "") else None

                    status = row.get("Object.status")

                    insert_sound_sql = """
                        INSERT INTO sound_measurements (
                            measurement_id, laeq, lai, laiMax, battery, status
                        )
                        VALUES (%s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                            laeq = VALUES(laeq),
                            lai = VALUES(lai),
                            laiMax = VALUES(laiMax),
                            battery = VALUES(battery),
                            status = VALUES(status)
                    """

                    cursor.execute(
                        insert_sound_sql,
                        (measurement_id, laeq, lai, laiMax, battery, status),
                    )
                    sound_rows += 1

                except Exception as e:
                    errors += 1
                    print(f"[worker] Error procesando fila {processed}: {e}")

        conn.commit()

    except Exception as e:
        print(f"[worker] Error general procesando CSV {path_csv}: {e}")
        status = {
            "ok": False,
            "error": str(e),
            "processed": processed,
            "inserted_devices": inserted_devices,
            "updated_devices": updated_devices,
            "inserted_measurements": inserted_measurements,
            "updated_measurements": updated_measurements,
            "sound_rows": sound_rows,
            "errors": errors,
        }
    else:
        status = {
            "ok": True,
            "processed": processed,
            "inserted_devices": inserted_devices,
            "updated_devices": updated_devices,
            "inserted_measurements": inserted_measurements,
            "updated_measurements": updated_measurements,
            "sound_rows": sound_rows,
            "errors": errors,
        }
        print(f"[worker] CSV procesado OK: {status}")
    finally:
        try:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
        except Exception:
            pass
    
    # ---------- Notificación al backend vía HTTP ----------   
    import requests 

        # Notificar al backend
    try:
        backend_url = "http://backend:8070/notify"  # nombre del servicio en Docker
        msg = f"CSV procesado: {status['processed']} filas ({status['inserted_measurements']} nuevas)"
        requests.post(backend_url, json={"message": msg})
    except Exception as e:
        print(f"[worker] Error notificando al backend: {e}")
      
            
            
    # ---------- Log en Mongo: resumen del proceso ----------
    try:
        doc = {
            "path": path_csv,
            "file_name": os.path.basename(path_csv),
            "processed_at": datetime.utcnow(),
            "status": status,
        }
        uploads_collection.insert_one(doc)
        status["_logged_in_mongo"] = True
    except Exception as e:
        print(f"[worker] No se pudo registrar resumen en Mongo: {e}")
        status["_logged_in_mongo"] = False
        status["_mongo_log_error"] = str(e)

    return status