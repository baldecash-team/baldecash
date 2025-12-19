'use client';

/**
 * CustomSwitch - Switch component compatible with Tailwind v4
 *
 * Reemplazo del Switch de NextUI/HeroUI que no es compatible con Tailwind v4.
 * Usa framer-motion para animaciones suaves.
 *
 * @example
 * // Uncontrolled (estado interno)
 * <CustomSwitch defaultSelected>Label</CustomSwitch>
 *
 * // Controlled (estado externo)
 * <CustomSwitch isSelected={value} onValueChange={setValue}>Label</CustomSwitch>
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface CustomSwitchProps {
  /** Valor inicial cuando es uncontrolled */
  defaultSelected?: boolean;
  /** Valor controlado externamente */
  isSelected?: boolean;
  /** Callback cuando cambia el valor */
  onValueChange?: (value: boolean) => void;
  /** Tamaño del switch */
  size?: 'sm' | 'md' | 'lg';
  /** Color cuando está activo - usa colores del brandbook BaldeCash */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Deshabilitar interacción */
  isDisabled?: boolean;
  /** Label del switch */
  children?: React.ReactNode;
  /** Aria label para accesibilidad */
  'aria-label'?: string;
  /** Clases adicionales para el contenedor */
  className?: string;
}

// Configuración de tamaños
const sizeConfig = {
  sm: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 20 },
  md: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 24 },
  lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 28 },
};

// Colores del brandbook BaldeCash
const colorConfig = {
  primary: 'bg-[#4654CD]',      // Brand primary
  secondary: 'bg-[#03DBD0]',    // Brand secondary/accent
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

export function CustomSwitch({
  defaultSelected = false,
  isSelected: controlledSelected,
  onValueChange,
  size = 'sm',
  color = 'primary',
  isDisabled = false,
  children,
  'aria-label': ariaLabel,
  className = '',
}: CustomSwitchProps) {
  const [internalSelected, setInternalSelected] = useState(defaultSelected);

  const isControlled = controlledSelected !== undefined;
  const isOn = isControlled ? controlledSelected : internalSelected;

  const handleToggle = () => {
    if (isDisabled) return;

    if (!isControlled) {
      setInternalSelected(!isOn);
    }
    onValueChange?.(!isOn);
  };

  const { track, thumb, translate } = sizeConfig[size];
  const activeColor = colorConfig[color];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={ariaLabel}
      disabled={isDisabled}
      onClick={handleToggle}
      className={`
        inline-flex items-center gap-2 cursor-pointer
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div
        className={`
          ${track} rounded-full relative transition-colors duration-200 flex-shrink-0
          ${isOn ? activeColor : 'bg-neutral-300'}
        `}
      >
        <motion.div
          className={`
            ${thumb} bg-white rounded-full shadow-md absolute top-1/2
          `}
          initial={false}
          animate={{
            x: isOn ? translate : 2,
            y: '-50%',
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </div>
      {children && (
        <span className="text-sm text-neutral-700 select-none">{children}</span>
      )}
    </button>
  );
}

export default CustomSwitch;
