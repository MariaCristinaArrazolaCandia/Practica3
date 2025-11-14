-- =============================================
-- SENSOR MONITORING - ESQUEMA FUNCIONAL
-- =============================================

-- Eliminar la base de datos si existe
DROP DATABASE IF EXISTS sensor_monitoring;

-- Crear la base de datos
CREATE DATABASE sensor_monitoring 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE sensor_monitoring;

-- =============================================
-- TABLA DE DISPOSITIVOS (SIMPLIFICADA)
-- =============================================
CREATE TABLE devices (
    id VARCHAR(255) PRIMARY KEY,
    devEui VARCHAR(255),
    deviceName VARCHAR(255),
    deviceProfileName VARCHAR(255),
    tenantName VARCHAR(255),
    applicationName VARCHAR(255),
    description TEXT,
    address TEXT,
    location POINT,
    classEnabled VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA DE MEDICIONES (SIMPLIFICADA)
-- =============================================
CREATE TABLE measurements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    device_id VARCHAR(255) NOT NULL,
    measurement_time DATETIME,
    fcnt INT DEFAULT 0,
    fport INT DEFAULT 0,
    dr INT DEFAULT 0,
    adr BOOLEAN DEFAULT FALSE,
    confirmed BOOLEAN DEFAULT FALSE,
    raw_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA PARA SENSORES DE DISTANCIA
-- =============================================
CREATE TABLE distance_measurements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    measurement_id BIGINT NOT NULL,
    distance DECIMAL(10,2),
    position VARCHAR(100),
    battery DECIMAL(5,2),
    status VARCHAR(100),
    sensor_type VARCHAR(50)
);

-- =============================================
-- TABLA PARA SENSORES DE SONIDO
-- =============================================
CREATE TABLE sound_measurements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    measurement_id BIGINT NOT NULL,
    laeq DECIMAL(10,2),
    lai DECIMAL(10,2),
    laiMax DECIMAL(10,2),
    battery DECIMAL(5,2),
    status VARCHAR(100)
);

-- =============================================
-- TABLA PARA SENSORES CO2
-- =============================================
CREATE TABLE co2_measurements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    measurement_id BIGINT NOT NULL,
    co2 INT,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    pressure DECIMAL(8,2),
    battery DECIMAL(5,2)
);

-- =============================================
-- ÍNDICES BÁSICOS
-- =============================================
CREATE INDEX idx_devices_devEui ON devices(devEui);
CREATE INDEX idx_measurement_time ON measurements(measurement_time);
CREATE INDEX idx_device_measurements ON measurements(device_id);

SELECT '✅ Base de datos FUNCIONAL creada exitosamente!' as message;