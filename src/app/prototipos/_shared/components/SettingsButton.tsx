'use client';

import React from 'react';
import { Button, Tooltip } from '@nextui-org/react';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsButtonProps {
  onClick: () => void;
  isVisible?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  label?: string;
}

const positionClasses = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'top-right': 'top-6 right-6',
  'top-left': 'top-6 left-6',
};

/**
 * Botón flotante para abrir el modal de settings
 * Se muestra en preview mode para seleccionar versiones de componentes
 */
export function SettingsButton({
  onClick,
  isVisible = true,
  position = 'bottom-right',
  label = 'Configurar versiones',
}: SettingsButtonProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      className={`fixed ${positionClasses[position]} z-50`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <Tooltip content={label} placement="left">
        <Button
          isIconOnly
          size="lg"
          className="bg-[#4654CD] text-white shadow-lg hover:bg-[#3a47b3] hover:shadow-xl transition-all cursor-pointer"
          aria-label={label}
          onPress={onClick}
        >
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <Settings className="w-6 h-6" />
          </motion.div>
        </Button>
      </Tooltip>
    </motion.div>
  );
}

export default SettingsButton;
