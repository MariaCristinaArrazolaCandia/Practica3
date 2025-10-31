CREATE DATABASE IF NOT EXISTS sensor_monitoring;
USE sensor_monitoring;

-- Tabla principal de dispositivos
CREATE TABLE devices (
    id VARCHAR(255) PRIMARY KEY,
    devEui VARCHAR(255) UNIQUE NOT NULL,
    deviceName VARCHAR(255) NOT NULL,
    deviceProfileName VARCHAR(255),
    tenantName VARCHAR(255),
    applicationName VARCHAR(255),
    description TEXT,
    address TEXT,
    location POINT,
    classEnabled VARCHAR(50),
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
    raw_data varchar(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Tabla para datos de sensores de distancia (EM310, EM500, LLDS12)
CREATE TABLE distance_measurements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    measurement_id BIGINT NOT NULL,
    distance DECIMAL(10,2),
    position VARCHAR(100),
    battery DECIMAL(5,2),
    status VARCHAR(100),
    unit VARCHAR(20) DEFAULT 'cm',
    sensor_type ENUM('EM310', 'EM500', 'LLDS12'),
    FOREIGN KEY (measurement_id) REFERENCES measurements(id)
);

-- Tabla para datos de sensores de sonido
CREATE TABLE sound_measurements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    measurement_id BIGINT NOT NULL,
    laeq DECIMAL(10,2),
    lai DECIMAL(10,2),
    laiMax DECIMAL(10,2),
    battery DECIMAL(5,2),
    status VARCHAR(100),
    FOREIGN KEY (measurement_id) REFERENCES measurements(id)
);

-- Índices para mejorar el rendimiento de consultas
CREATE INDEX idx_measurement_time ON measurements(measurement_time);
CREATE INDEX idx_device_measurements ON measurements(device_id, measurement_time);
CREATE INDEX idx_distance_sensor ON distance_measurements(sensor_type);
CREATE INDEX idx_sound_measurements ON sound_measurements(measurement_id);