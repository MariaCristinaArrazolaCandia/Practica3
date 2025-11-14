import pandas as pd
import json
from typing import List, Dict, Any
from datetime import datetime
import hashlib

class CSVProcessorWorking:
    def __init__(self):
        pass

    def clean_string(self, value, default="Unknown"):
        """Limpia strings de forma segura"""
        if pd.isna(value) or value == "" or value is None:
            return default
        cleaned = str(value).strip()
        # Limitar a 250 caracteres para evitar problemas de BD
        return cleaned[:250]

    def clean_numeric(self, value):
        """Limpia valores numéricos"""
        if pd.isna(value) or value == "" or value is None:
            return 0.0
        try:
            return float(value)
        except:
            return 0.0

    def clean_boolean(self, value):
        """Convierte a booleano"""
        if pd.isna(value) or value == "" or value is None:
            return False
        return str(value).upper() == 'TRUE'

    def generate_device_id(self, row, sensor_type, index):
        """Genera un ID de dispositivo único y corto"""
        # Usar devEui si está disponible
        dev_eui = self.clean_string(row.get('deviceInfo.devEui'))
        if dev_eui != "Unknown":
            return f"{sensor_type}_{dev_eui[-6:]}_{index}"
        
        # Usar deviceName si está disponible
        device_name = self.clean_string(row.get('deviceInfo.deviceName'))
        if device_name != "Unknown":
            return f"{sensor_type}_{device_name[-6:]}_{index}"
        
        # Generar ID basado en hash
        unique_str = f"{sensor_type}_{index}_{datetime.now().timestamp()}"
        return f"{sensor_type}_{hashlib.md5(unique_str.encode()).hexdigest()[:8]}"

    def process_em310(self, file_path: str) -> List[Dict[str, Any]]:
        return self._process_file(file_path, 'EM310')

    def process_em500(self, file_path: str) -> List[Dict[str, Any]]:
        return self._process_file(file_path, 'EM500')

    def process_ws302(self, file_path: str) -> List[Dict[str, Any]]:
        return self._process_file(file_path, 'WS302')

    def _process_file(self, file_path: str, sensor_type: str) -> List[Dict[str, Any]]:
        """Procesa archivos CSV de forma robusta"""
        try:
            df = pd.read_csv(file_path)
            processed_data = []
            
            print(f"📖 Leyendo {file_path} - {len(df)} filas")
            
            for index, row in df.iterrows():
                try:
                    # Generar ID único y corto
                    device_id = self.generate_device_id(row, sensor_type, index)

                    # Datos del dispositivo
                    device_data = {
                        'id': device_id,
                        'devEui': self.clean_string(row.get('deviceInfo.devEui'), f"eui_{index}"),
                        'deviceName': self.clean_string(row.get('deviceInfo.deviceName'), f"device_{index}"),
                        'deviceProfileName': self.clean_string(row.get('deviceInfo.deviceProfileName'), f"profile_{sensor_type}"),
                        'tenantName': self.clean_string(row.get('deviceInfo.tenantName'), "Default"),
                        'applicationName': self.clean_string(row.get('deviceInfo.applicationName'), "Default"),
                        'description': self.clean_string(row.get('deviceInfo.tags.Description'), f"Sensor {sensor_type}"),
                        'address': self.clean_string(row.get('deviceInfo.tags.Address'), "Unknown"),
                        'location': None,  # Simplificado por ahora
                        'classEnabled': self.clean_string(row.get('deviceInfo.deviceClassEnabled'), "CLASS_A")
                    }

                    # Datos de medición
                    measurement_data = {
                        'device_id': device_id,
                        'measurement_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),  # Usar tiempo actual
                        'fcnt': int(self.clean_numeric(row.get('fCnt'))),
                        'fport': int(self.clean_numeric(row.get('fPort'))),
                        'dr': int(self.clean_numeric(row.get('dr'))),
                        'adr': self.clean_boolean(row.get('adr')),
                        'confirmed': self.clean_boolean(row.get('confirmed')),
                        'raw_data': self.clean_string(row.get('data'), "")
                    }

                    # Datos específicos del sensor
                    sensor_data = self._extract_sensor_data(row, sensor_type)

                    processed_record = {
                        'device': device_data,
                        'measurement': measurement_data,
                        'sensor_data': sensor_data,
                        'sensor_type': sensor_type
                    }
                    
                    processed_data.append(processed_record)
                    
                except Exception as e:
                    print(f"⚠️  Error en fila {index}: {e}")
                    continue
            
            print(f"✅ {len(processed_data)} registros procesados de {sensor_type}")
            return processed_data
            
        except Exception as e:
            print(f"❌ Error procesando {file_path}: {e}")
            return []

    def _extract_sensor_data(self, row: pd.Series, sensor_type: str) -> Dict[str, Any]:
        """Extrae datos específicos del sensor"""
        if sensor_type == 'EM310':
            return {
                'distance': self.clean_numeric(row.get('object.distance')),
                'position': self.clean_string(row.get('object.position'), "unknown"),
                'battery': self.clean_numeric(row.get('object.battery')) or self.clean_numeric(row.get('batteryLevel')) or 100.0,
                'status': self.clean_string(row.get('object.status'), "normal")
            }
        elif sensor_type == 'EM500':
            return {
                'distance': None,
                'position': None,
                'battery': self.clean_numeric(row.get('object.battery')) or self.clean_numeric(row.get('batteryLevel')) or 100.0,
                'status': self.clean_string(row.get('object.co2_status'), "normal"),
                'co2': int(self.clean_numeric(row.get('object.co2'))),
                'temperature': self.clean_numeric(row.get('object.temperature')),
                'humidity': self.clean_numeric(row.get('object.humidity')),
                'pressure': self.clean_numeric(row.get('object.pressure'))
            }
        elif sensor_type == 'WS302':
            return {
                'laeq': self.clean_numeric(row.get('object.LAeq')),
                'lai': self.clean_numeric(row.get('object.LAI')),
                'laimax': self.clean_numeric(row.get('object.LAImax')),
                'battery': self.clean_numeric(row.get('object.battery')) or self.clean_numeric(row.get('batteryLevel')) or 100.0,
                'status': self.clean_string(row.get('object.status'), "normal")
            }
        return {}