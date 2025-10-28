import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Battery, Calendar, Droplets, Wind, Volume2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockSensors, generateSensorReadings } from '../utils/mockData';
import { SensorReading } from '../types';

interface SensorDetailProps {
  sensorId: string;
  onBack: () => void;
}

export function SensorDetail({ sensorId, onBack }: SensorDetailProps) {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const sensor = mockSensors.find((s) => s.id === sensorId);

  useEffect(() => {
    if (sensor) {
      setReadings(generateSensorReadings(sensor.id));
    }
  }, [sensor]);

  if (!sensor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="border-0 shadow-lg rounded-2xl p-8">
          <p className="text-slate-600">Sensor no encontrado</p>
          <Button onClick={onBack} className="mt-4 rounded-xl">
            Volver
          </Button>
        </Card>
      </div>
    );
  }

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'EM310':
        return Droplets;
      case 'EM500':
        return Wind;
      case 'WS302':
        return Volume2;
      default:
        return MapPin;
    }
  };

  const getSensorColor = (type: string) => {
    switch (type) {
      case 'EM310':
        return 'from-blue-500 to-cyan-600';
      case 'EM500':
        return 'from-green-500 to-emerald-600';
      case 'WS302':
        return 'from-yellow-500 to-orange-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const Icon = getSensorIcon(sensor.type);

  const chartData = readings.map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    value: reading.value,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <Button onClick={onBack} variant="outline" className="mb-4 rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Sensores
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sensor Info Card */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden sticky top-24">
              <div className={`h-3 bg-gradient-to-r ${getSensorColor(sensor.type)}`} />
              <CardHeader>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${getSensorColor(sensor.type)}`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="mb-2">{sensor.name}</CardTitle>
                    <Badge
                      className={`${
                        sensor.status === 'critical'
                          ? 'bg-red-500'
                          : sensor.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      } text-white rounded-full`}
                    >
                      {sensor.status === 'critical'
                        ? 'Crítico'
                        : sensor.status === 'warning'
                        ? 'Advertencia'
                        : 'Normal'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Value */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl text-center">
                  <p className="text-sm text-slate-600 mb-1">Valor Actual</p>
                  <p className="text-slate-900">
                    {sensor.currentValue} {sensor.unit}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-slate-600" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-600">Ubicación</p>
                      <p className="text-sm text-slate-900">{sensor.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <span className="text-slate-600">📍</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-600">Coordenadas</p>
                      <p className="text-sm text-slate-900">
                        {sensor.coordinates.lat.toFixed(4)}, {sensor.coordinates.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Battery className="w-5 h-5 text-slate-600" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-600">Batería</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              sensor.battery > 70
                                ? 'bg-green-500'
                                : sensor.battery > 30
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${sensor.battery}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-900">{sensor.battery}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-slate-600" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-600">Última Lectura</p>
                      <p className="text-sm text-slate-900">
                        {new Date(sensor.lastReading).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <span className="text-slate-600">🔧</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-600">Tipo de Sensor</p>
                      <p className="text-sm text-slate-900">{sensor.type}</p>
                    </div>
                  </div>
                </div>

                {/* Actions - Removed Map View */}
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Historical Chart */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle>Historial de Lecturas (24 horas)</CardTitle>
                <CardDescription>Valores registrados por hora</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={sensor.type === 'EM310' ? '#0ea5e9' : sensor.type === 'EM500' ? '#22c55e' : '#facc15'}
                      strokeWidth={3}
                      dot={{ fill: '#fff', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardDescription>Valor Promedio</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-900">
                    {(readings.reduce((sum, r) => sum + r.value, 0) / readings.length).toFixed(2)} {sensor.unit}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardDescription>Valor Máximo</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-900">
                    {Math.max(...readings.map((r) => r.value)).toFixed(2)} {sensor.unit}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardDescription>Valor Mínimo</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-900">
                    {Math.min(...readings.map((r) => r.value)).toFixed(2)} {sensor.unit}
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
