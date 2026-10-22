'use client';

/**
 * TextInput - Estilo 0.3 con bordes completos
 * Label arriba, input con bordes redondeados
 */

import React, { useState } from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { FieldTooltip } from './FieldTooltip';
import {
  useCamposV2,
  ETIQUETA_V2,
  CAJA_V2,
  PREFIJO_V2,
  PLACEHOLDER_V2,
  bordeV2,
  MarcaOpcionalV2,
  ErrorCampoV2,
} from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

export interface TextInputProps {
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
  /** Extra onWheel handler from the caller (still called before our own handling) */
  onWheel?: React.WheelEventHandler<HTMLInputElement>;
  /** Ref al <input> real (p. ej. para reubicar el cursor tras reformatear) */
  inputRef?: React.Ref<HTMLInputElement>;
  /** Teclas sobre el <input> (p. ej. flechas o borrar en el campo Monto) */
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  /** Pegar sobre el <input> (p. ej. el campo Monto lee el texto pegado) */
  onPaste?: React.ClipboardEventHandler<HTMLInputElement>;
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
  onWheel,
  inputRef,
  onKeyDown,
  onPaste,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const v2 = useCamposV2();
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
    return 'border-neutral-300';
  };

  const inputProps = {
    ref: inputRef,
    name: id,
    type,
    inputMode: getInputMode(),
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    onKeyDown,
    onPaste,
    onFocus: () => {
      setIsFocused(true);
      onFocus?.();
    },
    onBlur: () => {
      setIsFocused(false);
      onBlur?.();
    },
    placeholder,
    disabled,
    maxLength,
    min,
    max,
    step,
    onWheel: (e: React.WheelEvent<HTMLInputElement>) => {
      onWheel?.(e);
      // Un input type="number" enfocado cambia su valor con la rueda del
      // mouse (medido en prod: 500 -> rueda abajo -> 499). React expone
      // onWheel como passive, así que preventDefault() acá no sirve: la
      // única forma de frenarlo es sacarle el foco. Sin foco, el navegador
      // ya no toca el valor y la página sigue scrolleando normal.
      if (type === 'number') {
        e.currentTarget.blur();
      }
    },
  };

  // Diseño 2 (BAL-4960): mismo input y mismos eventos, otro vestido. La pista
  // (`hint`) la pinta `DynamicWizardStep` debajo, y el error la reemplaza.
  if (v2) {
    return (
      <div id={id} className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-input`} className={ETIQUETA_V2}>
          {label}
          {!required && <MarcaOpcionalV2 />}
          {tooltip && <FieldTooltip tooltip={tooltip} />}
        </label>
        {helpText && <p className="text-[13px] text-[#5B6275]">{helpText}</p>}
        <div
          className={`flex items-center overflow-hidden ${CAJA_V2} ${bordeV2({ error: showError, foco: isFocused, correcto: !!showSuccess })} ${
            disabled ? 'bg-[#F7F8FA] opacity-70' : ''
          }`}
        >
          {startContent && <span className={PREFIJO_V2}>{startContent}</span>}
          <input
            {...inputProps}
            id={`${id}-input`}
            aria-invalid={showError || undefined}
            className={`h-full min-w-0 flex-1 bg-transparent px-3.5 text-base text-[#1E2230] outline-none ${PLACEHOLDER_V2} ${
              disabled ? 'cursor-not-allowed' : ''
            }`}
            style={{
              WebkitBoxShadow: '0 0 0 1000px white inset',
              ...(value ? { WebkitTextFillColor: '#1E2230' } : {}),
            }}
          />
          {endContent && <span className="flex-shrink-0 select-none pr-3 text-base text-[#5B6275]">{endContent}</span>}
          {isLoading && <Loader2 className="mr-3.5 h-5 w-5 flex-shrink-0 animate-spin text-[#4654CD]" />}
          {!isLoading && showSuccess && <Check className="mr-3.5 h-5 w-5 flex-shrink-0 text-[#0E8C78]" strokeWidth={2.6} />}
        </div>
        {error && !hideErrorText && <ErrorCampoV2>{error}</ErrorCampoV2>}
      </div>
    );
  }

  return (
    <div id={id} className={small ? 'space-y-1' : 'space-y-1.5'}>
      {/* Label */}
      <label className={`flex items-center gap-1.5 font-medium text-neutral-700 ${small ? 'text-xs' : 'text-sm'}`}>
        {label}
        {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
        {tooltip && <FieldTooltip tooltip={tooltip} />}
      </label>

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-neutral-500">{helpText}</p>
      )}

      {/* Input */}
      <div
        className={`
          flex items-center gap-2 px-3
          rounded-lg border-2 transition-all duration-200 bg-white
          ${small ? 'h-9' : 'h-11'}
          ${getBorderColor()}
          ${disabled ? 'opacity-50 bg-neutral-50' : ''}
        `}
      >
        {startContent && (
          <span className="text-neutral-500 text-base flex-shrink-0 select-none">{startContent}</span>
        )}
        <input
          {...inputProps}
          className={`
            flex-1 bg-transparent outline-none text-base text-neutral-800
            placeholder:text-neutral-400
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          style={{
            // Override browser autofill background
            WebkitBoxShadow: '0 0 0 1000px white inset',
            ...(value ? { WebkitTextFillColor: '#262626' } : {}),
          }}
        />
        {endContent && (
          <span className="text-neutral-500 text-base flex-shrink-0 select-none">{endContent}</span>
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
            <p className="text-xs text-neutral-400 flex-shrink-0">
              {value.length}/{maxLength}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TextInput;
