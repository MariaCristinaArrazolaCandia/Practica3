import { useState } from 'react';
import { Leaf, Bell, User, LogOut, UserCircle, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { motion } from 'motion/react';
import { User as UserType } from '../types';
import { useTheme } from '../utils/themeContext';

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
  onOpenAlerts: () => void;
  alertCount: number;
}

export function Header({ user, onLogout, onOpenAlerts, alertCount }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-card border-b border-border sticky top-0 z-40 shadow-sm transition-colors"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-foreground">Monitoreo Ambiental</h1>
            <p className="text-sm text-muted-foreground">Cochabamba Inteligente</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl hover:bg-accent transition-colors"
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Sun className="w-5 h-5 text-muted-foreground" />
            )}
          </Button>

          {/* Alerts Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl hover:bg-accent transition-colors"
            onClick={onOpenAlerts}
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {alertCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs rounded-full">
                {alertCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl hover:bg-accent px-3 py-2 transition-colors cursor-pointer border-0 bg-transparent">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl bg-popover border-border">
              <DropdownMenuItem className="gap-2 cursor-pointer rounded-lg text-popover-foreground hover:bg-accent">
                <UserCircle className="w-4 h-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 rounded-lg hover:bg-accent" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}