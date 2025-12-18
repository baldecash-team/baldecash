'use client';

/**
 * ValidationSummary - Resumen de errores de validación
 *
 * Muestra todos los errores del formulario en un lugar.
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ValidationSummaryProps {
  errors: { field: string; message: string }[];
  onDismiss?: () => void;
  onFieldClick?: (fieldId: string) => void;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  errors,
  onDismiss,
  onFieldClick,
}) => {
  if (errors.length === 0) return null;

  return (
    <div className="bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#ef4444]/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-[#ef4444]">
              {errors.length === 1
                ? 'Hay un error que corregir'
                : `Hay ${errors.length} errores que corregir`}
            </h4>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="w-6 h-6 rounded-full hover:bg-[#ef4444]/10 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#ef4444]" />
              </button>
            )}
          </div>

          <ul className="mt-2 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>
                {onFieldClick ? (
                  <button
                    type="button"
                    onClick={() => onFieldClick(error.field)}
                    className="text-sm text-[#ef4444]/80 hover:text-[#ef4444] hover:underline text-left cursor-pointer"
                  >
                    • {error.message}
                  </button>
                ) : (
                  <span className="text-sm text-[#ef4444]/80">
                    • {error.message}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ValidationSummary;
