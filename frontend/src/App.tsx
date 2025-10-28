import { useState } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SensorList } from './components/SensorList';
import { SensorDetail } from './components/SensorDetail';
import { Reports } from './components/Reports';
import { AlertsPanel } from './components/AlertsPanel';
import { Toaster } from './components/ui/sonner';
import { User } from './types';
import { mockAlerts } from './utils/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './utils/themeContext';

type Screen =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'sensors'
  | 'sensorDetail'
  | 'reports';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [isAlertsPanelOpen, setIsAlertsPanelOpen] = useState(false);

  const handleLogin = (email: string, password: string) => {
    // Simulate login
    setUser({
      name: email.split('@')[0],
      email: email,
      role: 'Administrador',
    });
    setCurrentScreen('dashboard');
  };

  const handleRegister = (name: string, email: string, password: string, role: string) => {
    // Simulate registration
    setUser({
      name: name,
      email: email,
      role: role as any,
    });
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
  };

  const handleNavigateToSensorDetail = (sensorId: string) => {
    setSelectedSensorId(sensorId);
    setCurrentScreen('sensorDetail');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <Login
            onLogin={handleLogin}
            onNavigateToRegister={() => setCurrentScreen('register')}
          />
        );
      case 'register':
        return (
          <Register
            onRegister={handleRegister}
            onNavigateToLogin={() => setCurrentScreen('login')}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            onNavigateToSensors={() => setCurrentScreen('sensors')}
            onNavigateToReports={() => setCurrentScreen('reports')}
            onNavigateToSensorDetail={handleNavigateToSensorDetail}
          />
        );
      case 'sensors':
        return (
          <SensorList
            onBack={() => setCurrentScreen('dashboard')}
            onSensorDetail={handleNavigateToSensorDetail}
          />
        );
      case 'sensorDetail':
        return (
          <SensorDetail
            sensorId={selectedSensorId || '1'}
            onBack={() => setCurrentScreen('sensors')}
          />
        );
      case 'reports':
        return <Reports onBack={() => setCurrentScreen('dashboard')} />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        {user && currentScreen !== 'login' && currentScreen !== 'register' && (
          <Header
            user={user}
            onLogout={handleLogout}
            onOpenAlerts={() => setIsAlertsPanelOpen(true)}
            alertCount={mockAlerts.length}
          />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>

        {user && (
          <AlertsPanel
            isOpen={isAlertsPanelOpen}
            onClose={() => setIsAlertsPanelOpen(false)}
            alerts={mockAlerts}
            onViewReports={() => {
              setCurrentScreen('reports');
              setIsAlertsPanelOpen(false);
            }}
          />
        )}
      </div>
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  );
}
