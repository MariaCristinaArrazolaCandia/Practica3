from mysql.connector import Error

MYSQL_CONFIG = {
    "host": "mysql",              # nombre del servicio en docker-compose
    "port": 3306,
    "user": "root",
    "password": "admin",
    "database": "sensor_monitoring",
}

def get_mysql_conn():
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        return conn
    except Error as e:
        print("Error de conexión MySQL:", e)
        return None