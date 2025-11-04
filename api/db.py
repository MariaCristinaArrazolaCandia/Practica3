import mysql.connector
from mysql.connector import Error
from pymongo import MongoClient

# --- MySQL ---
def get_mysql_conn():
    """
    Devuelve una conexión viva a MySQL dentro de Docker.
    Acordate de cerrar la conexión cuando termines de usarla.
    """
    try:
        conn = mysql.connector.connect(
            host="mysql",            # nombre del servicio docker-compose
            port=3306,               # puerto interno del contenedor mysql
            user="root",
            password="root123",
            database="etl_system"
        )
        return conn
    except Error as e:
        print("Error conectando a MySQL:", e)
        return None

# --- Mongo ---
# Creamos el cliente global una sola vez
mongo_client = MongoClient("mongodb://mongo:27017")

# Elegimos una base de datos lógica (puedes cambiar el nombre)
mongo_db = mongo_client["etl_system"]  # por ejemplo "etl_system"
# ejemplo de colección
mongo_collection = mongo_db["uploads"]  # una colección para guardar info sobre archivos subidos
