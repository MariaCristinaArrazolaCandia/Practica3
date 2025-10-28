import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { motion } from 'motion/react';
import { ArrowLeft, Download, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockSensors } from '../utils/mockData';
import { toast } from 'sonner';

interface ReportsProps {
  onBack: () => void;
}

export function Reports({ onBack }: ReportsProps) {
  const [dateRange, setDateRange] = useState('7days');
  const [sensorType, setSensorType] = useState('all');

  // Generate report data
  const generateReportData = () => {
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 1;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        temperatura: 16 + Math.random() * 8,
        co2: 380 + Math.random() * 60,
        ruido: 55 + Math.random() * 20,
        agua: 2 + Math.random() * 2,
      });
    }
    
    return data;
  };

  const reportData = generateReportData();

  const calculateStats = () => {
    const filteredSensors = sensorType === 'all' ? mockSensors : mockSensors.filter(s => s.type === sensorType);
    
    return {
      total: filteredSensors.length,
      active: filteredSensors.filter(s => s.status === 'normal').length,
      warning: filteredSensors.filter(s => s.status === 'warning').length,
      critical: filteredSensors.filter(s => s.status === 'critical').length,
    };
  };

  const stats = calculateStats();

  const handleExport = (format: string) => {
    toast.success(`Reporte exportado en formato ${format.toUpperCase()}`, {
      description: 'La descarga comenzará en breve',
    });
  };

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
            Volver al Dashboard
          </Button>
          <h2 className="text-slate-900 mb-2">Reportes y Análisis</h2>
          <p className="text-slate-600">Visualización de datos históricos y estadísticas</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <Label htmlFor="dateRange" className="mb-2 block">Rango de Fechas</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger id="dateRange" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="7days">Últimos 7 días</SelectItem>
                  <SelectItem value="30days">Últimos 30 días</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <Label htmlFor="sensorType" className="mb-2 block">Tipo de Sensor</Label>
              <Select value={sensorType} onValueChange={setSensorType}>
                <SelectTrigger id="sensorType" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="EM310">EM310 - Agua</SelectItem>
                  <SelectItem value="EM500">EM500 - Aire</SelectItem>
                  <SelectItem value="WS302">WS302 - Ruido</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600">
            <CardContent className="p-6 flex items-center justify-between text-white">
              <div>
                <p className="text-sm text-purple-100 mb-1">Exportar Reporte</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-lg"
                    onClick={() => handleExport('pdf')}
                  >
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-lg"
                    onClick={() => handleExport('csv')}
                  >
                    CSV
                  </Button>
                </div>
              </div>
              <Download className="w-8 h-8" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardDescription>Total Sensores</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-900">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardDescription>Activos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-green-600">{stats.active}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardDescription>Advertencia</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-600">{stats.warning}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardDescription>Críticos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{stats.critical}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle>Promedio Diario por Parámetro</CardTitle>
                <CardDescription>Comparación de valores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="temperatura" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Temperatura (°C)" />
                    <Bar dataKey="ruido" fill="#facc15" radius={[8, 8, 0, 0]} name="Ruido (dB)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Line Chart */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle>Tendencias de Calidad del Aire</CardTitle>
                <CardDescription>CO₂ y Agua</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="co2" stroke="#22c55e" strokeWidth={3} name="CO₂ (ppm)" />
                    <Line type="monotone" dataKey="agua" stroke="#0ea5e9" strokeWidth={3} name="Agua (m)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Summary Table */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>Resumen de Sensores</CardTitle>
              <CardDescription>Estado actual de todos los sensores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Sensor</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(sensorType === 'all' ? mockSensors : mockSensors.filter(s => s.type === sensorType)).map((sensor) => (
                      <TableRow key={sensor.id}>
                        <TableCell>{sensor.name}</TableCell>
                        <TableCell>{sensor.type}</TableCell>
                        <TableCell className="max-w-xs truncate">{sensor.location}</TableCell>
                        <TableCell>
                          {sensor.currentValue} {sensor.unit}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs ${
                              sensor.status === 'critical'
                                ? 'bg-red-100 text-red-700'
                                : sensor.status === 'warning'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {sensor.status === 'critical'
                              ? 'Crítico'
                              : sensor.status === 'warning'
                              ? 'Advertencia'
                              : 'Normal'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
