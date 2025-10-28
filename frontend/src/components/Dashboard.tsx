import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { motion } from 'motion/react';
import { MapPin, ListTree, BarChart3, Thermometer, Droplets, Wind, Volume2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sensor } from '../types';
import { mockSensors } from '../utils/mockData';

interface DashboardProps {
  onNavigateToSensors: () => void;
  onNavigateToReports: () => void;
  onNavigateToSensorDetail: (sensorId: string) => void;
}

export function Dashboard({
  onNavigateToSensors,
  onNavigateToReports,
  onNavigateToSensorDetail,
}: DashboardProps) {
  const [filter, setFilter] = useState<'all' | 'air' | 'water' | 'sound'>('all');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Generate chart data
    const data = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(Date.now() - i * 60 * 60 * 1000).getHours();
      data.push({
        hour: `${hour}:00`,
        temperatura: 16 + Math.random() * 8,
        co2: 380 + Math.random() * 60,
        ruido: 55 + Math.random() * 20,
        agua: 2 + Math.random() * 2,
      });
    }
    setChartData(data);
  }, []);

  const getFilteredSensors = (): Sensor[] => {
    if (filter === 'all') return mockSensors;
    return mockSensors.filter((s) => s.category === filter);
  };

  const calculateAverage = (category: string, unit: string) => {
    const sensors = mockSensors.filter((s) => s.unit === unit);
    if (sensors.length === 0) return 0;
    const sum = sensors.reduce((acc, s) => acc + s.currentValue, 0);
    return (sum / sensors.length).toFixed(1);
  };

  const kpiCards = [
    {
      title: 'Temperatura Promedio',
      value: `${calculateAverage('air', '°C')}°C`,
      icon: Thermometer,
      color: 'from-orange-500 to-amber-600',
      category: 'air',
    },
    {
      title: 'Nivel de Agua',
      value: `${calculateAverage('water', 'm')} m`,
      icon: Droplets,
      color: 'from-blue-500 to-cyan-600',
      category: 'water',
    },
    {
      title: 'CO₂ Promedio',
      value: `${calculateAverage('air', 'ppm')} ppm`,
      icon: Wind,
      color: 'from-green-500 to-emerald-600',
      category: 'air',
    },
    {
      title: 'Ruido Promedio',
      value: `${calculateAverage('sound', 'dB')} dB`,
      icon: Volume2,
      color: 'from-yellow-500 to-orange-600',
      category: 'sound',
    },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors">
      <div className="container mx-auto px-6 py-8">
        {/* Filter Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 bg-card rounded-2xl p-1.5 shadow-md border border-border">
              <TabsTrigger value="all" className="rounded-xl">Todos</TabsTrigger>
              <TabsTrigger value="air" className="rounded-xl">Aire</TabsTrigger>
              <TabsTrigger value="water" className="rounded-xl">Agua</TabsTrigger>
              <TabsTrigger value="sound" className="rounded-xl">Sonido</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {kpiCards.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => {
                const sensor = mockSensors.find(s => s.category === kpi.category);
                if (sensor) onNavigateToSensorDetail(sensor.id);
              }}
            >
              <Card className="border border-border shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all bg-card">
                <div className={`h-2 bg-gradient-to-r ${kpi.color}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-muted-foreground">{kpi.title}</CardDescription>
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${kpi.color}`}>
                      <kpi.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{kpi.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <Button
            onClick={onNavigateToSensors}
            className="h-20 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <ListTree className="w-5 h-5 mr-2" />
            Ver Lista de Sensores
          </Button>
          <Button
            onClick={onNavigateToReports}
            className="h-20 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Ver Reportes
          </Button>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="border border-border shadow-lg rounded-2xl bg-card transition-colors">
              <CardHeader>
                <CardTitle className="text-foreground">Temperatura (últimas 24 horas)</CardTitle>
                <CardDescription className="text-muted-foreground">Valores promedio por hora</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="hour" className="stroke-muted-foreground" />
                    <YAxis className="stroke-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        color: 'hsl(var(--popover-foreground))',
                      }}
                    />
                    <Line type="monotone" dataKey="temperatura" stroke="#f59e0b" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* CO2 Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <Card className="border border-border shadow-lg rounded-2xl bg-card transition-colors">
              <CardHeader>
                <CardTitle className="text-foreground">CO₂ (últimas 24 horas)</CardTitle>
                <CardDescription className="text-muted-foreground">Concentración en ppm</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="hour" className="stroke-muted-foreground" />
                    <YAxis className="stroke-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        color: 'hsl(var(--popover-foreground))',
                      }}
                    />
                    <Line type="monotone" dataKey="co2" stroke="#22c55e" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Noise Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="border border-border shadow-lg rounded-2xl bg-card transition-colors">
              <CardHeader>
                <CardTitle className="text-foreground">Ruido (últimas 24 horas)</CardTitle>
                <CardDescription className="text-muted-foreground">Nivel en decibeles (dB)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="hour" className="stroke-muted-foreground" />
                    <YAxis className="stroke-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        color: 'hsl(var(--popover-foreground))',
                      }}
                    />
                    <Line type="monotone" dataKey="ruido" stroke="#facc15" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Water Level Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            <Card className="border border-border shadow-lg rounded-2xl bg-card transition-colors">
              <CardHeader>
                <CardTitle className="text-foreground">Nivel de Agua (últimas 24 horas)</CardTitle>
                <CardDescription className="text-muted-foreground">Altura en metros</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="hour" className="stroke-muted-foreground" />
                    <YAxis className="stroke-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        color: 'hsl(var(--popover-foreground))',
                      }}
                    />
                    <Line type="monotone" dataKey="agua" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-12 text-sm text-muted-foreground"
        >
          GAMC — Secretaría de Ciudad Digital y Gobierno Electrónico 2025
        </motion.footer>
      </div>
    </div>
  );
}
