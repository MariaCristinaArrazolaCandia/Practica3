export interface Sensor {
  id: string;
  name: string;
  type: 'EM310' | 'EM500' | 'WS302';
  location: string;
  coordinates: { lat: number; lng: number };
  status: 'normal' | 'warning' | 'critical';
  battery: number;
  lastReading: string;
  currentValue: number;
  unit: string;
  category: 'water' | 'air' | 'sound';
}

export interface User {
  name: string;
  email: string;
  role: 'Administrador' | 'Investigador' | 'Técnico';
}

export interface Alert {
  id: string;
  sensor: string;
  message: string;
  severity: 'warning' | 'critical';
  timestamp: string;
}

export interface SensorReading {
  timestamp: string;
  value: number;
}
