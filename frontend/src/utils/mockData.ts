import { Sensor, Alert, SensorReading } from '../types';

export const mockSensors: Sensor[] = [
  {
    id: '1',
    name: 'Sensor Agua Laguna Alalay',
    type: 'EM310',
    location: 'Av. Alalay, Cochabamba',
    coordinates: { lat: -17.3895, lng: -66.1568 },
    status: 'normal',
    battery: 85,
    lastReading: new Date().toISOString(),
    currentValue: 3.2,
    unit: 'm',
    category: 'water',
  },
  {
    id: '2',
    name: 'Sensor CO₂ Plaza Colón',
    type: 'EM500',
    location: 'Plaza 14 de Septiembre, Cochabamba',
    coordinates: { lat: -17.3935, lng: -66.1570 },
    status: 'warning',
    battery: 72,
    lastReading: new Date().toISOString(),
    currentValue: 425,
    unit: 'ppm',
    category: 'air',
  },
  {
    id: '3',
    name: 'Sensor Ruido Av. Heroínas',
    type: 'WS302',
    location: 'Av. Heroínas esq. Ayacucho',
    coordinates: { lat: -17.3945, lng: -66.1575 },
    status: 'critical',
    battery: 45,
    lastReading: new Date().toISOString(),
    currentValue: 78,
    unit: 'dB',
    category: 'sound',
  },
  {
    id: '4',
    name: 'Sensor Temperatura Tunari',
    type: 'EM500',
    location: 'Parque Nacional Tunari',
    coordinates: { lat: -17.2850, lng: -66.2100 },
    status: 'normal',
    battery: 91,
    lastReading: new Date().toISOString(),
    currentValue: 18.5,
    unit: '°C',
    category: 'air',
  },
  {
    id: '5',
    name: 'Sensor Agua Río Rocha',
    type: 'EM310',
    location: 'Puente Libertador, Río Rocha',
    coordinates: { lat: -17.4100, lng: -66.1600 },
    status: 'warning',
    battery: 68,
    lastReading: new Date().toISOString(),
    currentValue: 1.8,
    unit: 'm',
    category: 'water',
  },
  {
    id: '6',
    name: 'Sensor CO₂ Zona Sur',
    type: 'EM500',
    location: 'Av. América, Zona Sur',
    coordinates: { lat: -17.4200, lng: -66.1450 },
    status: 'normal',
    battery: 88,
    lastReading: new Date().toISOString(),
    currentValue: 390,
    unit: 'ppm',
    category: 'air',
  },
  {
    id: '7',
    name: 'Sensor Ruido Terminal',
    type: 'WS302',
    location: 'Terminal de Buses',
    coordinates: { lat: -17.3650, lng: -66.1780 },
    status: 'warning',
    battery: 55,
    lastReading: new Date().toISOString(),
    currentValue: 72,
    unit: 'dB',
    category: 'sound',
  },
  {
    id: '8',
    name: 'Sensor Humedad Cristo',
    type: 'EM500',
    location: 'Cristo de la Concordia',
    coordinates: { lat: -17.3650, lng: -66.1950 },
    status: 'normal',
    battery: 94,
    lastReading: new Date().toISOString(),
    currentValue: 62,
    unit: '%',
    category: 'air',
  },
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    sensor: 'Sensor Ruido Av. Heroínas',
    message: 'Nivel de ruido crítico: 78 dB',
    severity: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '2',
    sensor: 'Sensor CO₂ Plaza Colón',
    message: 'CO₂ elevado: 425 ppm',
    severity: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '3',
    sensor: 'Sensor Agua Río Rocha',
    message: 'Nivel de agua bajo: 1.8m',
    severity: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];

export const generateSensorReadings = (sensorId: string): SensorReading[] => {
  const readings: SensorReading[] = [];
  const now = Date.now();
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 60 * 1000).toISOString();
    const sensor = mockSensors.find(s => s.id === sensorId);
    const baseValue = sensor?.currentValue || 0;
    const variance = baseValue * 0.2;
    const value = baseValue + (Math.random() - 0.5) * variance;
    
    readings.push({ timestamp, value: Math.round(value * 10) / 10 });
  }
  
  return readings;
};
