'use client';

/**
 * FieldLabelV1 - Label arriba (siempre visible)
 *
 * Estilo tradicional con label arriba del campo.
 * Siempre visible, máxima accesibilidad.
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';

export interface FieldLabelProps {
  htmlFor: string;
  label: string;
  required?: boolean;
  helpText?: string;
  onHelpClick?: () => void;
  className?: string;
}

export const FieldLabelV1: React.FC<FieldLabelProps> = ({
  htmlFor,
  label,
  required = false,
  helpText,
  onHelpClick,
  className = '',
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`flex items-center gap-1.5 text-sm font-medium text-neutral-700 ${className}`}
    >
      <span>{label}</span>
      {!required && (
        <span className="text-neutral-400 text-xs font-normal">(Opcional)</span>
      )}
      {helpText && (
        <button
          type="button"
          onClick={onHelpClick}
          className="text-neutral-400 hover:text-[#4654CD] transition-colors cursor-pointer"
          title={helpText}
          aria-label={`Ayuda: ${helpText}`}
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      )}
    </label>
  );
};

export default FieldLabelV1;
