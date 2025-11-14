-- Usamos la base de datos definida en el docker-compose.yml
-- CREATE DATABASE IF NOT EXISTS etl_system;
USE etl_system;

-- Tabla principal de dispositivos
CREATE TABLE devices (
    id VARCHAR(255) PRIMARY KEY,
    devEui VARCHAR(255) UNIQUE,
    deviceName VARCHAR(255) NOT NULL,
    deviceProfileName VARCHAR(255),
    tenantName VARCHAR(255),
    applicationName VARCHAR(255),
    description TEXT,
    address TEXT,
    location POINT,
    -- classEnabled VARCHAR(50), -- A menudo parte de la info del paquete, no del dispositivo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de mediciones principales
CREATE TABLE measurements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    device_id VARCHAR(255) NOT NULL,
    measurement_time DATETIME NOT NULL,
    fcnt INT,
    fport INT,
    dr INT,
    adr BOOLEAN,
    confirmed BOOLEAN,
    raw_data_hex varchar(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Tabla para datos de sensores de calidad del aire
CREATE TABLE air_quality_measurements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    measurement_id BIGINT NOT NULL,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    pressure DECIMAL(10,2),
    -- Campo JSON para cualquier otro dato decodificado no estructurado
    data JSON,
    battery DECIMAL(5,2),
    FOREIGN KEY (measurement_id) REFERENCES measurements(id)
);

-- Tabla para datos de sensores de sonido
CREATE TABLE sound_measurements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    measurement_id BIGINT NOT NULL UNIQUE, -- Cada medición principal solo tiene un set de datos de sonido
    laeq DECIMAL(10,2),
    lai DECIMAL(10,2),
    laiMax DECIMAL(10,2),
    battery DECIMAL(5,2),
    status VARCHAR(100),
    FOREIGN KEY (measurement_id) REFERENCES measurements(id)
);

-- Tabla para datos de sensores soterrados (distancia)
CREATE TABLE buried_measurements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    measurement_id BIGINT NOT NULL UNIQUE,
    distance_cm DECIMAL(10,2),
    status VARCHAR(100), -- e.g., 'filled', 'empty', 'error'
    battery DECIMAL(5,2),
    FOREIGN KEY (measurement_id) REFERENCES measurements(id)
);

-- Índices para mejorar el rendimiento de consultas
CREATE INDEX idx_measurement_time ON measurements(measurement_time);
CREATE INDEX idx_air_quality ON air_quality_measurements(measurement_id);
CREATE INDEX idx_sound ON sound_measurements(measurement_id);
CREATE INDEX idx_buried ON buried_measurements(measurement_id);