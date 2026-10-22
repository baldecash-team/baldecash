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
import {
  useCamposV2,
  ETIQUETA_V2,
  chipV2,
  MarcaOpcionalV2,
  ErrorCampoV2,
} from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';

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
  onFocus?: () => void;
  onBlur?: () => void;
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
  onFocus,
  onBlur,
  options,
  error,
  success,
  helpText,
  tooltip,
  disabled = false,
  required = true,
}) => {
  const showSuccess = success && !error && !!value;
  const v2 = useCamposV2();

  // Toggle: si ya está seleccionado, limpiar. Igual en los dos diseños.
  const elegir = (option: SegmentedOption) => {
    if (option.disabled || disabled) return;
    onFocus?.();
    if (value === option.value) {
      onChange('');
    } else {
      onChange(option.value);
    }
    onBlur?.();
  };

  // Diseño 2 (BAL-4960): botones-chip («Tipo de documento», «Situación
  // actual» del prototipo). Elegido: fondo de marca y texto blanco; los demás,
  // borde y texto de marca. Una fila con tantas columnas como opciones.
  if (v2) {
    return (
      <div id={id} role="group" aria-labelledby={`${id}-label`} className="flex flex-col gap-2.5">
        <span id={`${id}-label`} className={ETIQUETA_V2}>
          {label}
          {!required && <MarcaOpcionalV2 />}
          {tooltip && <FieldTooltip tooltip={tooltip} />}
        </span>
        <div
          className={`grid gap-2 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
          style={{ gridTemplateColumns: `repeat(${Math.max(options.length, 1)}, minmax(0, 1fr))` }}
        >
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => elegir(option)}
                disabled={option.disabled || disabled}
                className={`${chipV2(isSelected)} ${error && !isSelected ? '!border-[#C2410C]' : ''} ${
                  option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {helpText && !error && <p className="text-[13px] text-[#5B6275]">{helpText}</p>}
        {error && <ErrorCampoV2>{error}</ErrorCampoV2>}
      </div>
    );
  }

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
              onClick={() => elegir(option)}
              disabled={option.disabled || disabled}
              className={`
                relative flex-1 py-2.5 min-h-[44px] text-sm font-medium rounded-lg cursor-pointer
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

      {/* Reserve space to match TextInput's character counter (visual alignment) */}
      {!error && !showSuccess && !helpText && (
        <div className="h-4" aria-hidden="true" />
      )}
    </div>
  );
};

export default SegmentedControl;
