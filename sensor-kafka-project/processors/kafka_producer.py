from confluent_kafka import Producer
import json
import time
from config.kafka_config import PRODUCER_CONFIG, TOPICS

class SensorProducer:
    def __init__(self):
        self.producer = Producer(PRODUCER_CONFIG)  # Usar config específica para producer
        self.topics = TOPICS

    def delivery_report(self, err, msg):
        """Callback para reportar entrega de mensajes"""
        if err is not None:
            print(f'Error al entregar mensaje: {err}')
        else:
            print(f'Mensaje entregado a {msg.topic()} [{msg.partition()}]')

    def send_sensor_data(self, sensor_type: str, data: dict):
        """Envía datos del sensor a Kafka"""
        topic = self.topics.get(sensor_type.lower())
        if not topic:
            print(f"Topic no encontrado para sensor type: {sensor_type}")
            return

        try:
            # Convertir a JSON y enviar
            message = json.dumps(data, ensure_ascii=False)
            self.producer.produce(
                topic, 
                value=message.encode('utf-8'),
                callback=self.delivery_report
            )
            self.producer.poll(0)
            
        except Exception as e:
            print(f"Error enviando datos a Kafka: {e}")

    def flush(self):
        """Espera a que todos los mensajes sean entregados"""
        self.producer.flush()

    def produce_from_csv(self, csv_processor, file_path: str, sensor_type: str):
        """Produce mensajes desde un archivo CSV"""
        print(f"Procesando archivo: {file_path} para sensor: {sensor_type}")
        
        # Procesar CSV
        if sensor_type == 'EM310':
            data = csv_processor.process_em310(file_path)
        elif sensor_type == 'EM500':
            data = csv_processor.process_em500(file_path)
        elif sensor_type == 'WS302':
            data = csv_processor.process_ws302(file_path)
        else:
            print(f"Tipo de sensor no soportado: {sensor_type}")
            return

        # Enviar cada registro a Kafka
        for record in data:
            self.send_sensor_data(sensor_type, record)
            time.sleep(0.01)  # Pequeña pausa para no saturar

        self.flush()
        print(f"Completado envío de {len(data)} registros para {sensor_type}")