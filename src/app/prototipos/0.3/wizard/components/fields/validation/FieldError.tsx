'use client';

/**
 * FieldError - Mensaje de error para campos
 *
 * Muestra errores de validación de forma amigable.
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldErrorProps {
  message: string;
  variant?: 'inline' | 'toast';
}

export const FieldError: React.FC<FieldErrorProps> = ({
  message,
  variant = 'inline',
}) => {
  if (variant === 'toast') {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20">
        <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />
        <p className="text-sm text-[#ef4444]">{message}</p>
      </div>
    );
  }

  return (
    <p className="text-sm text-[#ef4444] flex items-center gap-1">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      {message}
    </p>
  );
};

export default FieldError;
