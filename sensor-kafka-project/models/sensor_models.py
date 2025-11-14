from dataclasses import dataclass
from typing import Optional, Dict, Any
import json

@dataclass
class Device:
    id: str
    devEui: str
    deviceName: str
    deviceProfileName: str
    tenantName: str
    applicationName: str
    description: str
    address: str
    location: str
    classEnabled: str

@dataclass
class Measurement:
    device_id: str
    measurement_time: str
    fcnt: Optional[int]
    fport: Optional[int]
    dr: Optional[int]
    adr: Optional[bool]
    confirmed: Optional[bool]
    raw_data: Optional[str]

@dataclass
class DistanceMeasurement:
    measurement_id: int
    distance: Optional[float]
    position: Optional[str]
    battery: Optional[float]
    status: Optional[str]
    sensor_type: str

@dataclass
class SoundMeasurement:
    measurement_id: int
    laeq: Optional[float]
    lai: Optional[float]
    laimax: Optional[float]
    battery: Optional[float]
    status: Optional[str]