'use client';

/**
 * FloatingControls - Controles flotantes estandarizados para preview pages
 *
 * Incluye:
 * - Botón de código (muestra config actual)
 * - Acciones adicionales opcionales
 * - Botón de configuración (abre settings modal)
 */

import React, { useState, ReactNode } from 'react';
import { Button, Tooltip } from '@nextui-org/react';
import { Settings, Code, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingAction {
  icon: ReactNode;
  onClick: () => void;
  tooltip?: string;
  variant?: 'primary' | 'secondary';
}

interface FloatingControlsProps {
  config: unknown;
  onSettingsClick: () => void;
  extraActions?: FloatingAction[];
  settingsTooltip?: string;
  codeTooltip?: string;
  position?: 'bottom-right' | 'bottom-left';
}

const positionClasses = {
  'bottom-right': 'bottom-6 right-6',
  'bottom-left': 'bottom-6 left-6',
};

export function FloatingControls({
  config,
  onSettingsClick,
  extraActions = [],
  settingsTooltip = 'Configurar versiones',
  codeTooltip = 'Ver configuración',
  position = 'bottom-right',
}: FloatingControlsProps) {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <>
      {/* Floating Buttons */}
      <motion.div
        className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-2`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Code Button */}
        <Tooltip content={codeTooltip} placement="left">
          <Button
            isIconOnly
            className="bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
            size="lg"
            onPress={() => setShowConfig(!showConfig)}
            aria-label={codeTooltip}
          >
            <Code className="w-5 h-5 text-neutral-600" />
          </Button>
        </Tooltip>

        {/* Extra Actions */}
        {extraActions.map((action, index) => (
          <Tooltip key={index} content={action.tooltip || ''} placement="left">
            <Button
              isIconOnly
              className={
                action.variant === 'primary'
                  ? 'bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors'
                  : 'bg-white shadow-lg border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors'
              }
              size="lg"
              onPress={action.onClick}
              aria-label={action.tooltip}
            >
              {action.icon}
            </Button>
          </Tooltip>
        ))}

        {/* Settings Button */}
        <Tooltip content={settingsTooltip} placement="left">
          <Button
            isIconOnly
            className="bg-[#4654CD] text-white shadow-lg cursor-pointer hover:bg-[#3a47b3] transition-colors"
            size="lg"
            onPress={onSettingsClick}
            aria-label={settingsTooltip}
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Settings className="w-5 h-5" />
            </motion.div>
          </Button>
        </Tooltip>
      </motion.div>

      {/* Config Panel */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            className={`fixed ${position === 'bottom-right' ? 'bottom-20 right-6' : 'bottom-20 left-6'} z-50 bg-white rounded-lg shadow-xl border border-neutral-200 p-4 w-72`}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-neutral-800">
              <Eye className="w-4 h-4" />
              Configuración Actual
            </h4>
            <pre className="text-xs bg-neutral-50 p-3 rounded overflow-auto max-h-60 text-neutral-600">
              {JSON.stringify(config, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default FloatingControls;
