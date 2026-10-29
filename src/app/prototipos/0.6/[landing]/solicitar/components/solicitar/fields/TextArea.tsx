'use client';

/**
 * TextArea - Estilo 0.3 con bordes completos
 * Label arriba, textarea con bordes redondeados
 */

import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { FieldTooltip } from './FieldTooltip';
import { PistaD1 } from './PistaD1';
import {
  useCamposV2,
  ETIQUETA_V2,
  bordeV2,
  MarcaOpcionalV2,
  ErrorCampoV2,
} from '@/app/prototipos/0.6/components/diseno-2/campos/estilosV2';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

interface TextAreaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  success?: boolean;
  helpText?: string;
  tooltip?: FieldTooltipInfo;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  /**
   * BAL-4960: true/false = mostrar/ocultar el contador. Sin valor = como
   * siempre: el área de texto lo muestra en los dos diseños.
   */
  showCounter?: boolean | null;
  /** Diseño 1 (BAL-5261): pista bajo el campo, en la línea del error; el error la reemplaza. */
  pista?: string | null;
}

export const TextArea: React.FC<TextAreaProps> = ({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  rows = 4,
  error,
  success,
  helpText,
  tooltip,
  disabled = false,
  required = true,
  maxLength,
  showCounter,
  pista,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  // Diseño 2 (BAL-4960): mismo texto largo, otro vestido.
  const v2 = useCamposV2();
  // BAL-4960: el área de texto siempre mostró el contador (en los dos diseños).
  const verContador = (showCounter ?? true) && !!maxLength;
  const showError = !!error;
  const showSuccess = success && !error && value;

  const getBorderColor = () => {
    if (showError) return 'border-[#ef4444]';
    if (showSuccess) return 'border-[#22c55e]';
    if (isFocused) return 'border-[var(--color-primary)]';
    return 'border-neutral-300';
  };

  return (
    <div id={id} className={v2 ? 'flex flex-col gap-1.5' : 'space-y-1.5'}>
      {/* Label */}
      {v2 ? (
        <label className={ETIQUETA_V2}>
          {label}
          {!required && <MarcaOpcionalV2 />}
          {tooltip && <FieldTooltip tooltip={tooltip} />}
        </label>
      ) : (
        <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
          {label}
          {!required && <span className="text-neutral-400 text-xs">(Opcional)</span>}
          {tooltip && <FieldTooltip tooltip={tooltip} />}
        </label>
      )}

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-neutral-500">{helpText}</p>
      )}

      {/* Textarea */}
      <div
        className={v2 ? `
          relative rounded-[10px] border-[1.5px] transition-colors duration-150 bg-white overflow-hidden
          ${bordeV2({ error: showError, foco: isFocused, correcto: !!showSuccess })}
          ${disabled ? 'opacity-70 bg-[var(--d2-campo-apagado)]' : ''}
        ` : `
          relative rounded-lg border-2 transition-all duration-200 bg-white overflow-hidden
          ${getBorderColor()}
          ${disabled ? 'opacity-50 bg-neutral-50' : ''}
        `}
      >
        <textarea
          id={id}
          name={id}
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
          rows={rows}
          aria-invalid={v2 && showError ? true : undefined}
          aria-describedby={v2 && error ? `${id}-error` : undefined}
          className={`
            w-full pl-3 pr-10 py-3 bg-transparent outline-none text-base text-neutral-800
            placeholder:text-neutral-400 resize-none
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          style={{
            // Override browser autofill background
            WebkitBoxShadow: '0 0 0 1000px white inset',
            ...(value ? { WebkitTextFillColor: '#262626' } : {}),
          }}
        />

        {/* Status icons */}
        <div className="absolute top-3 right-3">
          {showSuccess && <Check className={v2 ? 'w-5 h-5 text-[var(--d2-ok)]' : 'w-5 h-5 text-[#22c55e]'} />}
          {showError && !v2 && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
        </div>
      </div>

      {v2 && (error || verContador) && (
        <div className="flex items-start justify-between gap-2">
          {error ? <ErrorCampoV2 id={`${id}-error`}>{error}</ErrorCampoV2> : <span />}
          {verContador && <p className="flex-shrink-0 text-xs text-[var(--d2-texto-suave)]">{value.length}/{maxLength}</p>}
        </div>
      )}

      {/* Character counter & Error message - always reserve space for alignment */}
      {!v2 && <div className="flex items-center justify-between gap-2 min-h-[20px]">
        {error ? (
          <p className="text-sm text-[#ef4444] flex items-center gap-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        ) : pista ? (
          // Diseño 1 (BAL-5261): la pista, en la línea del error.
          <PistaD1 id={id}>{pista}</PistaD1>
        ) : (
          <span />
        )}
        {verContador && (
          <p className="text-xs text-neutral-400 flex-shrink-0">
            {value.length}/{maxLength}
          </p>
        )}
      </div>}
    </div>
  );
};

export default TextArea;
