import pandas as pd
import numpy as np
from typing import Dict, Any, List
import re

class DataCleaner:
    @staticmethod
    def clean_location(location_str: str) -> str:
        """Limpia y formatea la cadena de ubicación"""
        if pd.isna(location_str) or location_str == "":
            return None
        
        try:
            # Extraer coordenadas del string
            coords = re.findall(r'-?\d+\.\d+', str(location_str))
            if len(coords) >= 2:
                lat, lon = coords[0], coords[1]
                return f"POINT({lon} {lat})"
            return None
        except:
            return None

    @staticmethod
    def clean_boolean(value: Any) -> bool:
        """Convierte valores a booleano"""
        if pd.isna(value) or value == "":
            return False
        return str(value).upper() == 'TRUE'

    @staticmethod
    def clean_numeric(value: Any) -> float:
        """Limpia valores numéricos"""
        if pd.isna(value) or value == "":
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None

    @staticmethod
    def clean_string(value: Any, max_length: int = None) -> str:
        """Limpia strings, opcionalmente trunca a max_length"""
        if pd.isna(value) or value == "":
            return None
        
        cleaned = str(value).strip()
        
        # Si se especifica max_length, truncar
        if max_length and len(cleaned) > max_length:
            cleaned = cleaned[:max_length]
            
        return cleaned

    @staticmethod
    def extract_sensor_data(row: pd.Series, sensor_type: str) -> Dict[str, Any]:
        """Extrae datos específicos del sensor según el tipo"""
        sensor_data = {}
        
        if sensor_type == 'EM310':
            sensor_data = {
                'distance': DataCleaner.clean_numeric(row.get('object.distance')),
                'position': DataCleaner.clean_string(row.get('object.position')),
                'battery': DataCleaner.clean_numeric(row.get('object.battery')),
                'status': DataCleaner.clean_string(row.get('object.status'))
            }
        elif sensor_type == 'EM500':
            sensor_data = {
                'distance': None,
                'position': None,
                'battery': DataCleaner.clean_numeric(row.get('object.battery')),
                'status': DataCleaner.clean_string(row.get('object.co2_status'))
            }
        elif sensor_type == 'WS302':
            sensor_data = {
                'laeq': DataCleaner.clean_numeric(row.get('object.LAeq')),
                'lai': DataCleaner.clean_numeric(row.get('object.LAI')),
                'laimax': DataCleaner.clean_numeric(row.get('object.LAImax')),
                'battery': DataCleaner.clean_numeric(row.get('object.battery')),
                'status': DataCleaner.clean_string(row.get('object.status'))
            }
        
        return sensor_data