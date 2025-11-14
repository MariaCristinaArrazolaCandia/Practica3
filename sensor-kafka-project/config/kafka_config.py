# Configuración SIMPLE para Producer
PRODUCER_CONFIG = {
    'bootstrap.servers': 'localhost:9092'
}

# Configuración SIMPLE para Consumer
CONSUMER_CONFIG = {
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'sensor_processor_group',
    'auto.offset.reset': 'earliest'
}

TOPICS = {
    'em310': 'sensor_em310',
    'em500': 'sensor_em500', 
    'ws302': 'sensor_ws302'
}