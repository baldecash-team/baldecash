'use client';

/**
 * Toast - Componente estandarizado de notificaciones
 * Tipos: success, error, warning, info, navigation, version
 * Posición: bottom-center por defecto
 * Duración: 3s por defecto (configurable)
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Navigation,
  Layers,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'navigation' | 'version';

export interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number; // ms, default 3000
  position?: 'top' | 'bottom'; // default bottom
}

// Configuración de estilos por tipo
const TOAST_STYLES: Record<ToastType, { bg: string; text: string; icon: React.ElementType }> = {
  success: {
    bg: 'bg-neutral-800',
    text: 'text-white',
    icon: CheckCircle2,
  },
  error: {
    bg: 'bg-neutral-800',
    text: 'text-white',
    icon: XCircle,
  },
  warning: {
    bg: 'bg-neutral-800',
    text: 'text-white',
    icon: AlertTriangle,
  },
  info: {
    bg: 'bg-white border border-neutral-200',
    text: 'text-neutral-800',
    icon: Info,
  },
  navigation: {
    bg: 'bg-neutral-800',
    text: 'text-white',
    icon: Navigation,
  },
  version: {
    bg: 'bg-[#4654CD]',
    text: 'text-white',
    icon: Layers,
  },
};

// Colores de iconos por tipo
const ICON_COLORS: Record<ToastType, string> = {
  success: 'text-[#22c55e]',
  error: 'text-[#ef4444]',
  warning: 'text-[#f59e0b]',
  info: 'text-[#4654CD]',
  navigation: 'text-white',
  version: 'text-white',
};

export function Toast({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 3000,
  position = 'bottom',
}: ToastProps) {
  // Auto-hide después de duration
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const styles = TOAST_STYLES[type];
  const Icon = styles.icon;
  const iconColor = ICON_COLORS[type];

  // Posición y animación según position
  const positionClass = position === 'top' ? 'top-20' : 'bottom-24';
  const initialY = position === 'top' ? -20 : 20;
  const exitY = position === 'top' ? -10 : 10;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: initialY, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: exitY, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`
            fixed ${positionClass} left-1/2 -translate-x-1/2 z-[200]
            px-4 py-3 rounded-xl shadow-lg
            flex items-center gap-3
            ${styles.bg} ${styles.text}
          `}
        >
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${type === 'info' ? 'bg-[#4654CD]/10' : ''}
              ${type === 'success' ? 'bg-[#22c55e]/20' : ''}
              ${type === 'error' ? 'bg-[#ef4444]/20' : ''}
              ${type === 'warning' ? 'bg-[#f59e0b]/20' : ''}
              ${type === 'navigation' || type === 'version' ? 'bg-white/10' : ''}
            `}
          >
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
          <p className="text-sm font-medium">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook para manejar el estado del toast
export interface UseToastReturn {
  toast: { message: string; type: ToastType } | null;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
  isVisible: boolean;
}

export function useToast(defaultDuration = 3000): UseToastReturn {
  const [toast, setToast] = React.useState<{ message: string; type: ToastType } | null>(null);

  const showToast = React.useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  }, []);

  const hideToast = React.useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    hideToast,
    isVisible: toast !== null,
  };
}

export default Toast;
