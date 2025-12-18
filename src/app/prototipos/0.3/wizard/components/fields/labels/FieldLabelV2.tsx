'use client';

/**
 * FieldLabelV2 - Label flotante (moderno, ahorra espacio)
 *
 * Label que flota dentro del input y sube al enfocar/tener valor.
 * Diseño moderno que ahorra espacio vertical.
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';

export interface FloatingLabelProps {
  htmlFor: string;
  label: string;
  required?: boolean;
  helpText?: string;
  onHelpClick?: () => void;
  isActive: boolean; // true when focused or has value
  hasError?: boolean;
  className?: string;
}

export const FieldLabelV2: React.FC<FloatingLabelProps> = ({
  htmlFor,
  label,
  required = false,
  helpText,
  onHelpClick,
  isActive,
  hasError = false,
  className = '',
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`
        absolute left-3 transition-all duration-200 pointer-events-none
        flex items-center gap-1
        ${isActive
          ? 'top-0 -translate-y-1/2 text-xs bg-white px-1'
          : 'top-1/2 -translate-y-1/2 text-sm'
        }
        ${hasError
          ? 'text-[#ef4444]'
          : isActive
            ? 'text-[#4654CD] font-medium'
            : 'text-neutral-500'
        }
        ${className}
      `}
    >
      <span>{label}</span>
      {!required && isActive && (
        <span className="text-neutral-400 text-xs">(Opcional)</span>
      )}
      {helpText && isActive && (
        <button
          type="button"
          onClick={onHelpClick}
          className="text-neutral-400 hover:text-[#4654CD] transition-colors cursor-pointer pointer-events-auto"
          title={helpText}
          aria-label={`Ayuda: ${helpText}`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      )}
    </label>
  );
};

export default FieldLabelV2;
