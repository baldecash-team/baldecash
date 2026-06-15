'use client';

/**
 * TextArea - Estilo 0.3 con bordes completos
 * Label arriba, textarea con bordes redondeados
 */

import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { FieldTooltip } from './FieldTooltip';

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
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const showError = !!error;
  const showSuccess = success && !error && value;

  const getBorderColor = () => {
    if (showError) return 'border-[#ef4444]';
    if (showSuccess) return 'border-[#22c55e]';
    if (isFocused) return 'border-[var(--color-primary)]';
    return 'border-[var(--border-strong,#d1d5db)]';
  };

  return (
    <div id={id} className="space-y-1.5">
      {/* Label */}
      <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--text,#374151)]">
        {label}
        {!required && <span className="text-[var(--text-faint,#9ca3af)] text-xs">(Opcional)</span>}
        {tooltip && <FieldTooltip tooltip={tooltip} />}
      </label>

      {/* Help text */}
      {helpText && (
        <p className="text-xs text-[var(--text-muted,#6b7280)]">{helpText}</p>
      )}

      {/* Textarea */}
      <div
        className={`
          relative rounded-lg border-2 transition-all duration-200 bg-[var(--surface,#fff)] overflow-hidden
          ${getBorderColor()}
          ${disabled ? 'opacity-50 bg-[var(--surface-bg,#fafafa)]' : ''}
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
          className={`
            w-full pl-3 pr-10 py-3 bg-transparent outline-none text-base text-[var(--text-strong,#1f2937)]
            placeholder:text-[var(--text-faint,#9ca3af)] resize-none
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          style={{
            // Override browser autofill background (tokenizado: oscuro en nvidia, blanco en claro)
            WebkitBoxShadow: '0 0 0 1000px var(--surface, #fff) inset',
            ...(value ? { WebkitTextFillColor: 'var(--text-strong, #262626)' } : {}),
          }}
        />

        {/* Status icons */}
        <div className="absolute top-3 right-3">
          {showSuccess && <Check className="w-5 h-5 text-[#22c55e]" />}
          {showError && <AlertCircle className="w-5 h-5 text-[#ef4444]" />}
        </div>
      </div>

      {/* Character counter & Error message - always reserve space for alignment */}
      <div className="flex items-center justify-between gap-2 min-h-[20px]">
        {error ? (
          <p className="text-sm text-[#ef4444] flex items-center gap-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        ) : (
          <span />
        )}
        {maxLength && (
          <p className="text-xs text-[var(--text-faint,#9ca3af)] flex-shrink-0">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export default TextArea;
