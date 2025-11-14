from confluent_kafka import Consumer
import json
import time
from config.kafka_config import CONSUMER_CONFIG, TOPICS
from config.database import DatabaseConnection

class SensorConsumerWorking:
    def __init__(self, timeout_seconds=120):
        self.consumer = Consumer(CONSUMER_CONFIG)
        self.db = DatabaseConnection()
        self.connection = self.db.connect()
        self.timeout_seconds = timeout_seconds
        self.processed_count = 0
        self.start_time = time.time()
        
        topics = list(TOPICS.values())
        self.consumer.subscribe(topics)
        print(f"📡 Consumidor listo - Topics: {topics}")

    def process_message(self, msg):
        """Procesa un mensaje de forma simple y robusta"""
        try:
            data = json.loads(msg.value().decode('utf-8'))
            sensor_type = data.get('sensor_type', 'UNKNOWN')
            
            # Insertar en base de datos
            success = self._insert_to_database(data, sensor_type)
            
            if success:
                self.consumer.commit(msg)
                self.processed_count += 1
                if self.processed_count % 10 == 0:
                    print(f"✅ {self.processed_count} mensajes procesados")
            else:
                print(f"❌ Error insertando mensaje {sensor_type}")
                
        except Exception as e:
            print(f"❌ Error procesando mensaje: {e}")

    def _insert_to_database(self, data: dict, sensor_type: str) -> bool:
        """Inserta datos en MySQL de forma simple"""
        cursor = None
        try:
            cursor = self.connection.cursor()
            
            # 1. Insertar dispositivo
            device_data = data['device']
            self._insert_device(cursor, device_data)
            
            # 2. Insertar medición
            measurement_id = self._insert_measurement(cursor, data['measurement'])
            if not measurement_id:
                return False
            
            # 3. Insertar datos del sensor según el tipo
            sensor_data = data['sensor_data']
            if sensor_type == 'EM310':
                self._insert_distance_measurement(cursor, measurement_id, sensor_data, 'EM310')
            elif sensor_type == 'EM500':
                self._insert_distance_measurement(cursor, measurement_id, sensor_data, 'EM500')
                self._insert_co2_measurement(cursor, measurement_id, sensor_data)
            elif sensor_type == 'WS302':
                self._insert_sound_measurement(cursor, measurement_id, sensor_data)
            
            self.connection.commit()
            return True
            
        except Exception as e:
            if cursor:
                self.connection.rollback()
            print(f"❌ Error BD: {e}")
            return False
        finally:
            if cursor:
                cursor.close()

    def _insert_device(self, cursor, device_data: dict):
        """Inserta dispositivo (INSERT IGNORE para evitar duplicados)"""
        query = """
        INSERT IGNORE INTO devices 
        (id, devEui, deviceName, deviceProfileName, tenantName, applicationName, description, address, classEnabled)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            device_data['id'],
            device_data['devEui'],
            device_data['deviceName'],
            device_data['deviceProfileName'],
            device_data['tenantName'],
            device_data['applicationName'],
            device_data['description'],
            device_data['address'],
            device_data['classEnabled']
        ))

    def _insert_measurement(self, cursor, measurement_data: dict) -> int:
        """Inserta medición y retorna ID"""
        query = """
        INSERT INTO measurements 
        (device_id, measurement_time, fcnt, fport, dr, adr, confirmed, raw_data)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            measurement_data['device_id'],
            measurement_data['measurement_time'],
            measurement_data['fcnt'],
            measurement_data['fport'],
            measurement_data['dr'],
            measurement_data['adr'],
            measurement_data['confirmed'],
            measurement_data['raw_data']
        ))
        return cursor.lastrowid

    def _insert_distance_measurement(self, cursor, measurement_id: int, sensor_data: dict, sensor_type: str):
        """Inserta medición de distancia"""
        query = """
        INSERT INTO distance_measurements 
        (measurement_id, distance, position, battery, status, sensor_type)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            measurement_id,
            sensor_data.get('distance'),
            sensor_data.get('position'),
            sensor_data.get('battery'),
            sensor_data.get('status'),
            sensor_type
        ))

    def _insert_sound_measurement(self, cursor, measurement_id: int, sensor_data: dict):
        """Inserta medición de sonido"""
        query = """
        INSERT INTO sound_measurements 
        (measurement_id, laeq, lai, laiMax, battery, status)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            measurement_id,
            sensor_data.get('laeq'),
            sensor_data.get('lai'),
            sensor_data.get('laimax'),
            sensor_data.get('battery'),
            sensor_data.get('status')
        ))

    def _insert_co2_measurement(self, cursor, measurement_id: int, sensor_data: dict):
        """Inserta medición de CO2"""
        query = """
        INSERT INTO co2_measurements 
        (measurement_id, co2, temperature, humidity, pressure, battery)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            measurement_id,
            sensor_data.get('co2'),
            sensor_data.get('temperature'),
            sensor_data.get('humidity'),
            sensor_data.get('pressure'),
            sensor_data.get('battery')
        ))

    def start_consuming(self):
        """Inicia el consumo de mensajes"""
        print("🔄 Iniciando consumidor...")
        
        try:
            while time.time() - self.start_time < self.timeout_seconds:
                msg = self.consumer.poll(1.0)
                
                if msg is None:
                    # Si no hay mensajes por 30 segundos, terminar
                    if time.time() - self.start_time > 30 and self.processed_count == 0:
                        print("⏰ Timeout - No hay mensajes para procesar")
                        break
                    continue
                
                if msg.error():
                    continue
                
                self.process_message(msg)
                
        except KeyboardInterrupt:
            print("\n🛑 Detenido por usuario")
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            print(f"\n📊 RESUMEN: {self.processed_count} mensajes procesados")
            self.consumer.close()
            self.db.disconnect()