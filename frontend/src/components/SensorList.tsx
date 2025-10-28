import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { motion } from 'motion/react';
import { ArrowLeft, Search, TrendingUp, Droplets, Wind, Volume2, Battery } from 'lucide-react';
import { mockSensors } from '../utils/mockData';

interface SensorListProps {
  onBack: () => void;
  onSensorDetail: (sensorId: string) => void;
}

export function SensorList({ onBack, onSensorDetail }: SensorListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'warning' | 'critical'>('all');

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'EM310':
        return Droplets;
      case 'EM500':
        return Wind;
      case 'WS302':
        return Volume2;
      default:
        return TrendingUp;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge className="bg-red-500 text-white rounded-full">Crítico</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 text-white rounded-full">Advertencia</Badge>;
      default:
        return <Badge className="bg-green-500 text-white rounded-full">Normal</Badge>;
    }
  };

  const filteredSensors = mockSensors.filter((sensor) => {
    const matchesSearch =
      sensor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sensor.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sensor.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sensor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background transition-colors">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <Button onClick={onBack} variant="outline" className="mb-4 rounded-xl border-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          <h2 className="text-foreground mb-2">Lista de Sensores</h2>
          <p className="text-muted-foreground">{filteredSensors.length} sensores encontrados</p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre, tipo o ubicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl shadow-md border-border bg-card"
            />
          </div>

          {/* Status Filter */}
          <Tabs value={statusFilter} onValueChange={(v: 'all' | 'normal' | 'warning' | 'critical') => setStatusFilter(v)}>
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-card rounded-2xl p-1.5 shadow-md border border-border">
              <TabsTrigger value="all" className="rounded-xl">Todos</TabsTrigger>
              <TabsTrigger value="normal" className="rounded-xl">✓ Activos</TabsTrigger>
              <TabsTrigger value="warning" className="rounded-xl">⚠ Advertencia</TabsTrigger>
              <TabsTrigger value="critical" className="rounded-xl">🔴 Crítico</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSensors.map((sensor, index) => {
            const Icon = getSensorIcon(sensor.type);
            return (
              <motion.div
                key={sensor.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="border border-border shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer bg-card">
                  <div className={`h-2 bg-gradient-to-r ${getSensorColor(sensor.type)}`} />
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${getSensorColor(sensor.type)}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-foreground mb-1 truncate">{sensor.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{sensor.location}</p>
                        </div>
                      </div>
                      {getStatusBadge(sensor.status)}
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                        <span className="text-sm text-muted-foreground">Tipo</span>
                        <span className="text-foreground">{sensor.type}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                        <span className="text-sm text-muted-foreground">Valor Actual</span>
                        <span className="text-foreground">
                          {sensor.currentValue} {sensor.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                        <div className="flex items-center gap-2">
                          <Battery className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Batería</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-border rounded-full overflow-hidden">
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
                          <span className="text-sm text-foreground">{sensor.battery}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => onSensorDetail(sensor.id)}
                      className={`w-full bg-gradient-to-r ${getSensorColor(
                        sensor.type
                      )} hover:opacity-90 rounded-xl`}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Ver Detalle
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredSensors.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Search className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-foreground mb-2">No se encontraron sensores</h3>
            <p className="text-muted-foreground">Intenta con otros términos de búsqueda</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
