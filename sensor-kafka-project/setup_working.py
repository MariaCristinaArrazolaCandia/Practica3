import mysql.connector
from mysql.connector import Error
import os

def setup_database():
    """Crea la base de datos de forma simple"""
    print("🗄️  Configurando base de datos...")
    
    try:
        # Conectar a MySQL
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='ssm354123'
        )
        cursor = connection.cursor()
        print("✅ Conectado a MySQL")
        
        # Leer el archivo SQL
        sql_file = 'sql/create_database_working.sql'
        if not os.path.exists(sql_file):
            print(f"❌ No encontrado: {sql_file}")
            return False
        
        with open(sql_file, 'r', encoding='utf-8') as file:
            sql_content = file.read()
        
        # Ejecutar cada statement
        statements = sql_content.split(';')
        for statement in statements:
            clean_statement = statement.strip()
            if clean_statement and not clean_statement.startswith('--'):
                try:
                    cursor.execute(clean_statement)
                    print(f"✅ Ejecutado: {clean_statement[:50]}...")
                except Error as e:
                    # Ignorar errores esperados
                    if "database exists" not in str(e).lower():
                        print(f"⚠️  {e}")
        
        connection.commit()
        cursor.close()
        connection.close()
        
        print("🎉 Base de datos configurada exitosamente!")
        return True
        
    except Error as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    setup_database()