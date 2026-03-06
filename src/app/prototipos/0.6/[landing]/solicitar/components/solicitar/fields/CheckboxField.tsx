'use client';

/**
 * CheckboxField - Casilla de verificación
 * Soporta dos modos:
 * 1. Simple (sin opciones): Un solo checkbox para sí/no
 * 2. Múltiple (con opciones): Varias casillas donde se pueden seleccionar múltiples
 */

import React from 'react';
import { AlertCircle, CheckCircle2, Check } from 'lucide-react';
import { FieldTooltip } from './FieldTooltip';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

interface CheckboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CheckboxFieldProps {
  id: string;
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options?: CheckboxOption[];
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
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
  // Determinar si es modo simple (sin opciones) o múltiple (con opciones)
  const isSimpleMode = !options || options.length === 0;

  // Para modo simple, value es "true" o "false" como string
  const isCheckedSimple = value === 'true';

  // Para modo múltiple, value es un array de valores seleccionados
  const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

  const showSuccess = success && !error && (isSimpleMode ? isCheckedSimple : selectedValues.length > 0);

  // Handler para modo simple
  const handleSimpleChange = () => {
    if (disabled) return;
    onChange(isCheckedSimple ? 'false' : 'true');
  };

  // Handler para modo múltiple
  const handleMultipleChange = (optionValue: string) => {
    if (disabled) return;
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    onChange(newValues);
  };

  // Renderizar checkbox individual
  const renderCheckbox = (
    checked: boolean,
    onToggle: () => void,
    checkboxLabel?: string,
    isDisabled?: boolean
  ) => (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled || disabled}
      className={`
        flex items-center gap-3 w-full text-left
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div
        className={`
          w-5 h-5 rounded flex items-center justify-center border-2 transition-all flex-shrink-0
          ${checked
            ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
            : error
              ? 'border-red-300 bg-white'
              : 'border-neutral-300 bg-white hover:border-neutral-400'
          }
        `}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </div>
      {checkboxLabel && (
        <span className="text-sm text-neutral-700">{checkboxLabel}</span>
      )}
    </button>
  );

  return (
    <div id={id} className="space-y-3">
      {/* Label (solo para modo múltiple o como título) */}
      {!isSimpleMode && (
        <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
          {label}
          {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
          {tooltip && <FieldTooltip tooltip={tooltip} />}
        </label>
      )}

      {/* Modo simple: un solo checkbox con el label */}
      {isSimpleMode && (
        <div className="flex items-start gap-3">
          {renderCheckbox(isCheckedSimple, handleSimpleChange)}
          <div className="flex-1">
            <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 cursor-pointer" onClick={handleSimpleChange}>
              {label}
              {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
              {tooltip && <FieldTooltip tooltip={tooltip} />}
            </label>
          </div>
        </div>
      )}

      {/* Modo múltiple: lista de checkboxes */}
      {!isSimpleMode && options && (
        <div className="space-y-2">
          {options.map((option) => (
            <div
              key={option.value}
              className={`
                p-3 rounded-xl border transition-all
                ${selectedValues.includes(option.value)
                  ? 'border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.05)]'
                  : error
                    ? 'border-red-200 bg-white'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }
              `}
            >
              {renderCheckbox(
                selectedValues.includes(option.value),
                () => handleMultipleChange(option.value),
                option.label,
                option.disabled
              )}
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      {helpText && !error && (
        <p className="text-xs text-neutral-500">{helpText}</p>
      )}

      {/* Success message */}
      {showSuccess && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {isSimpleMode ? 'Confirmado' : `${selectedValues.length} seleccionado${selectedValues.length > 1 ? 's' : ''}`}
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

export default CheckboxField;
