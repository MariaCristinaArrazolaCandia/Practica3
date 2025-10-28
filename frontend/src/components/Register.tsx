import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Leaf, Lock, Mail, User } from 'lucide-react';

interface RegisterProps {
  onRegister: (name: string, email: string, password: string, role: string) => void;
  onNavigateToLogin: () => void;
}

export function Register({ onRegister, onNavigateToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: boolean } = {};
    
    if (!name) newErrors.name = true;
    if (!email) newErrors.email = true;
    if (!password) newErrors.password = true;
    if (password !== confirmPassword) newErrors.confirmPassword = true;
    if (!role) newErrors.role = true;
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onRegister(name, email, password, role);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1578913020856-1c5ded2ce3e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNpdHklMjBzdXN0YWluYWJsZXxlbnwxfHx8fDE3NjEzODA2MjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Green city"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 via-green-600/80 to-teal-700/90 flex items-center justify-center">
          <div className="text-white text-center px-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Leaf className="w-20 h-20 mx-auto mb-6" />
              <h1 className="mb-4">Únete a la Red de Monitoreo</h1>
              <p className="text-green-50 max-w-md mx-auto">
                Forma parte del equipo que trabaja por un Cochabamba más verde y sostenible
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Right side - Register Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center bg-background p-8 transition-colors"
      >
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h2 className="mb-2 text-foreground">Crear Cuenta</h2>
            <p className="text-muted-foreground">Sistema de Monitoreo Ambiental GAMC</p>
          </div>

          {/* Register Form */}
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            onSubmit={handleSubmit}
            className="bg-card rounded-3xl shadow-lg p-8 space-y-6 border border-border transition-colors"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`pl-10 rounded-xl bg-input-background ${errors.name ? 'border-red-500' : 'border-input'}`}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@gamc.gob.bo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 rounded-xl bg-input-background ${errors.email ? 'border-red-500' : 'border-input'}`}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 rounded-xl bg-input-background ${errors.password ? 'border-red-500' : 'border-input'}`}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 rounded-xl bg-input-background ${errors.confirmPassword ? 'border-red-500' : 'border-input'}`}
                  required
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol de Usuario</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className={`rounded-xl ${errors.role ? 'border-red-500' : 'border-input'}`}>
                  <SelectValue placeholder="Selecciona tu rol" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Investigador">Investigador</SelectItem>
                  <SelectItem value="Técnico">Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl h-12"
            >
              Crear Cuenta
            </Button>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">¿Ya tienes una cuenta? </span>
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Inicia sesión aquí
              </button>
            </div>
          </motion.form>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            Gobierno Autónomo Municipal de Cochabamba
            <br />
            Ciudad Inteligente 2025
          </p>
        </div>
      </motion.div>
    </div>
  );
}
