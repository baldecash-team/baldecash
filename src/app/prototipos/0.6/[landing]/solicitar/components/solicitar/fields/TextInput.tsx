'use client';

/**
 * TextInput - Estilo 0.3 con bordes completos
 * Label arriba, input con bordes redondeados
 */

import React, { useState } from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { FieldTooltip } from './FieldTooltip';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date';
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  showCounter?: boolean;
  compact?: boolean;
  /** Smaller height variant for tight layouts (h-9 instead of h-11) */
  small?: boolean;
  inputMode?: 'text' | 'tel' | 'numeric' | 'email' | 'decimal' | 'search' | 'url' | 'none';
  /** Suppress error text below the field (border stays red) */
  hideErrorText?: boolean;
  /** Show loading spinner (e.g., while checking person data) */
  isLoading?: boolean;
  /** Content rendered before the input (e.g., currency symbol, country code) */
  startContent?: React.ReactNode;
  /** Content rendered after the input (e.g., unit suffix like "kg", "cm") */
  endContent?: React.ReactNode;
  /** Minimum value for number inputs */
  min?: number;
  /** Maximum value for number inputs */
  max?: number;
  /** Step increment for number inputs */
  step?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  type = 'text',
  error,
  success,
  helpText,
  tooltip,
  disabled = false,
  required = true,
  maxLength,
  showCounter = true,
  compact = false,
  small = false,
  hideErrorText = false,
  inputMode: inputModeProp,
  isLoading = false,
  startContent,
  endContent,
  min,
  max,
  step,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const showError = !!error;
  const showSuccess = success && !error && value;

  const getInputMode = () => {
    // Si se pasa inputMode como prop, usarlo
    if (inputModeProp) return inputModeProp;
    // Si no, inferir del type
    switch (type) {
      case 'tel':
        return 'tel';
      case 'number':
        return 'numeric';
      case 'email':
        return 'email';
      default:
        return 'text';
    }
  };

  const getBorderColor = () => {
    if (showError) return 'border-[#ef4444]';
    if (showSuccess) return 'border-[#22c55e]';
    if (isFocused) return 'border-[var(--color-primary)]';
    return 'border-[var(--border-strong,#d1d5db)]';
  };

  return (
    <div id={id} className={small ? 'space-y-1' : 'space-y-1.5'}>
      {/* Label */}
      <label className={`flex items-center gap-1.5 font-medium text-[var(--text,#374151)] ${small ? 'text-xs' : 'text-sm'}`}>
        {label}
        {!required && <span className="text-[var(--text-faint,#9ca3af)] text-xs">(Opcional)</span>}
        {tooltip && <FieldTooltip tooltip={tooltip} />}
      </label>

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-[var(--text-muted,#6b7280)]">{helpText}</p>
      )}

      {/* Input */}
      <div
        className={`
          flex items-center gap-2 px-3
          rounded-lg border-2 transition-all duration-200 bg-[var(--surface,#fff)]
          ${small ? 'h-9' : 'h-11'}
          ${getBorderColor()}
          ${disabled ? 'opacity-50 bg-[var(--surface-bg,#fafafa)]' : ''}
        `}
      >
        {startContent && (
          <span className="text-[var(--text-muted,#6b7280)] text-base flex-shrink-0 select-none">{startContent}</span>
        )}
        <input
          name={id}
          type={type}
          inputMode={getInputMode()}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          className={`
            flex-1 bg-transparent outline-none text-base text-[var(--text-strong,#1f2937)]
            placeholder:text-[var(--text-faint,#9ca3af)]
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          style={{
            // Override browser autofill background (tokenizado: oscuro en nvidia, blanco en claro)
            WebkitBoxShadow: '0 0 0 1000px var(--surface, #fff) inset',
            ...(value ? { WebkitTextFillColor: 'var(--text-strong, #262626)' } : {}),
          }}
        />
        {endContent && (
          <span className="text-[var(--text-muted,#6b7280)] text-base flex-shrink-0 select-none">{endContent}</span>
        )}

        {/* Status icons */}
        {isLoading && <Loader2 className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 animate-spin" />}
        {!isLoading && showSuccess && <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" />}
        {!isLoading && showError && <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />}
      </div>

      {/* Error message & Character counter */}
      {(!compact || error || (showCounter && maxLength)) && !hideErrorText && (
        <div className={`flex items-center justify-between gap-2 ${compact ? '' : 'min-h-[20px]'}`}>
          {error ? (
            <p className="text-sm text-[#ef4444] flex items-center gap-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          ) : (
            <span />
          )}
          {showCounter && maxLength && (
            <p className="text-xs text-[var(--text-faint,#9ca3af)] flex-shrink-0">
              {value.length}/{maxLength}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TextInput;
