'use client';

/**
 * SegmentedControl - Toggle buttons estilo iOS/Apple
 * Usado para campos con 2-3 opciones mutuamente excluyentes
 * Botones con fondo deslizante animado
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { FieldTooltip } from './FieldTooltip';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

interface SegmentedOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SegmentedControlProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SegmentedOption[];
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
  success,
  helpText,
  tooltip,
  disabled = false,
  required = true,
}) => {
  const showSuccess = success && !error && !!value;
  return (
    <div id={id} className="space-y-3">
      {/* Label */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
        {label}
        {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
        {tooltip && <FieldTooltip tooltip={tooltip} />}
      </label>

      {/* Segmented Control */}
      <div
        className={`
          flex w-full p-1 rounded-xl bg-neutral-100 border
          ${error ? 'border-red-300' : showSuccess ? 'border-green-400' : 'border-neutral-200'}
          ${disabled ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                if (option.disabled || disabled) return;
                // Toggle: si ya está seleccionado, limpiar
                if (value === option.value) {
                  onChange('');
                } else {
                  onChange(option.value);
                }
              }}
              disabled={option.disabled || disabled}
              className={`
                relative flex-1 py-2.5 text-sm font-medium rounded-lg cursor-pointer
                transition-colors duration-200 z-10
                ${isSelected ? 'text-[var(--color-primary)]' : 'text-neutral-600 hover:text-neutral-800'}
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isSelected && (
                <motion.div
                  layoutId={`segmented-bg-${id}`}
                  className="absolute inset-0 bg-[rgba(var(--color-primary-rgb),0.15)] rounded-lg"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  style={{ zIndex: -1 }}
                />
              )}
              <span className="relative">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Help text */}
      {helpText && !error && (
        <p className="text-xs text-neutral-500">{helpText}</p>
      )}

      {/* Success message */}
      {showSuccess && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Seleccionado
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-[#ef4444] flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default SegmentedControl;
