import time
import sys
import os

print("=== SISTEMA DE SENSORES - VERSIÓN FUNCIONAL ===")
print("🚀 Iniciando...")

# Agregar el directorio actual al path
sys.path.append(os.path.dirname(__file__))

try:
    from processors.csv_processor_working import CSVProcessorWorking
    from processors.kafka_producer import SensorProducer
    from processors.kafka_consumer_working import SensorConsumerWorking
    print("✅ Módulos importados correctamente")
except ImportError as e:
    print(f"❌ Error importando módulos: {e}")
    sys.exit(1)

def check_files():
    """Verifica que los archivos CSV existan"""
    files = ['data/EM310.csv', 'data/EM500.csv', 'data/WS302.csv']
    for file in files:
        if not os.path.exists(file):
            print(f"❌ No encontrado: {file}")
            return False
        print(f"✅ {file}")
    return True

def main():
    if not check_files():
        return

    print("\n" + "="*50)
    print("FASE 1: PRODUCCIÓN")
    print("="*50)
    
    # Producir mensajes
    processor = CSVProcessorWorking()
    producer = SensorProducer()

    total_messages = 0
    for file_name, sensor_type in [('data/EM310.csv', 'EM310'), ('data/EM500.csv', 'EM500'), ('data/WS302.csv', 'WS302')]:
        print(f"\n📁 Procesando: {file_name}")
        
        # Obtener datos
        if sensor_type == 'EM310':
            data = processor.process_em310(file_name)
        elif sensor_type == 'EM500':
            data = processor.process_em500(file_name)
        else:
            data = processor.process_ws302(file_name)
        
        # Enviar a Kafka
        for record in data:
            producer.send_sensor_data(sensor_type, record)
            total_messages += 1
        
        producer.flush()
        print(f"✅ {len(data)} mensajes enviados")
        time.sleep(1)

    print(f"\n🎉 PRODUCCIÓN COMPLETADA: {total_messages} mensajes")

    print("\n" + "="*50)
    print("FASE 2: CONSUMO")
    print("="*50)
    
    print("⏳ Esperando 5 segundos...")
    time.sleep(5)
    
    # Consumir mensajes
    consumer = SensorConsumerWorking(timeout_seconds=180)
    consumer.start_consuming()

    print("\n🎊 ¡PROCESO TERMINADO!")

if __name__ == "__main__":
    main()