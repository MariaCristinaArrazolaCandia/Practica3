from fastapi import APIRouter, HTTPException
from db import get_mysql_conn, mongo_collection

router = APIRouter(tags=["data"])

@router.get("/mysql/ping")
def mysql_ping():
    """
    Ejemplo simple: leer datos desde MySQL.
    Puedes cambiar esto para leer tu propia tabla.
    """
    conn = get_mysql_conn()
    if conn is None:
        raise HTTPException(status_code=500, detail="No se pudo conectar a MySQL")

    try:
        cursor = conn.cursor()
        # Creamos tabla de ejemplo si no existe
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS upload_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255),
                rows_in INT,
                processed_at DATETIME
            )
        """)
        conn.commit()

        # Leemos todas las filas
        cursor.execute("SELECT id, filename, rows_in, processed_at FROM upload_logs ORDER BY id DESC")
        rows = cursor.fetchall()

        # Convertimos a objetos JSON-friendly
        result = [
            {
                "id": r[0],
                "filename": r[1],
                "rows_in": r[2],
                "processed_at": r[3].isoformat() if r[3] else None,
            }
            for r in rows
        ]

        return {"ok": True, "data": result}

    finally:
        conn.close()


@router.post("/mongo/upload-meta")
def save_upload_metadata(filename: str, rows_in: int, output_file: str):
    """
    Guarda metadata de un archivo procesado en Mongo.
    """
    doc = {
        "filename": filename,
        "rows_in": rows_in,
        "output_file": output_file
    }
    insert_result = mongo_collection.insert_one(doc)

    return {
        "ok": True,
        "mongo_id": str(insert_result.inserted_id),
        "stored": doc
    }
