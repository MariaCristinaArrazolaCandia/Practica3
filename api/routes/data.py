from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
import mysql.connector
from mysql.connector import Error
import json
from decimal import Decimal

router = APIRouter(prefix="/data", tags=["Data"])

# --- Conexión a MongoDB ---
client = MongoClient("mongodb://mongo:27017")
db = client["EMERGENTES_Monitoreo_GAMC"]

# --- Conexión a MySQL ---
def get_mysql_conn():
    try:
        return mysql.connector.connect(
            host="mysql",
            port=3306,
            user="root",
            password="root123",
            database="etl_system"
        )
    except Error as e:
        print("Error conectando a MySQL desde API:", e)
        return None

def default_serializer(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Type {type(obj)} not serializable")

def fetch_query(query: str):
    """Ejecuta una consulta SELECT y devuelve los resultados como una lista de diccionarios."""
    conn = get_mysql_conn()
    if not conn:
        raise HTTPException(status_code=503, detail="No se pudo conectar a la base de datos MySQL.")
    
    try:
        cursor = conn.cursor(dictionary=True) # Devuelve filas como diccionarios
        cursor.execute(query)
        results = cursor.fetchall()
        # Serializar tipos de datos no estándar como Decimal
        return json.loads(json.dumps(results, default=default_serializer))
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Error en la consulta a la base de datos: {e}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

@router.get("/mongo/uploads")
def get_mongo_uploads():
    coll = db["uploads"]
    items = list(coll.find({}, {"_id": 0}))
    return items

@router.get("/air-quality")
def get_air_quality_data():
    """Obtiene los últimos 10 registros de calidad del aire."""
    query = "SELECT * FROM air_quality_measurements ORDER BY id DESC LIMIT 10"
    return fetch_query(query)

@router.get("/sound")
def get_sound_data():
    """Obtiene los últimos 10 registros de sonido."""
    query = "SELECT * FROM sound_measurements ORDER BY id DESC LIMIT 10"
    return fetch_query(query)

@router.get("/buried")
def get_buried_data():
    """Obtiene los últimos 10 registros de sensores soterrados."""
    query = "SELECT * FROM buried_measurements ORDER BY id DESC LIMIT 10"
    return fetch_query(query)

