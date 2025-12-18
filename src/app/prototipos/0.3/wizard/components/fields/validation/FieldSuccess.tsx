'use client';

/**
 * FieldSuccess - Mensaje de éxito para campo válido
 *
 * Feedback positivo sutil cuando el campo está válido.
 */

import React from 'react';
import { Check } from 'lucide-react';

interface FieldSuccessProps {
  message?: string;
  show: boolean;
  className?: string;
}

export const FieldSuccess: React.FC<FieldSuccessProps> = ({
  message,
  show,
  className = '',
}) => {
  if (!show) return null;

  return (
    <p
      className={`
        text-sm text-[#22c55e] flex items-center gap-1 transition-all
        ${className}
      `}
      role="status"
      aria-live="polite"
    >
      <Check className="w-4 h-4 flex-shrink-0" />
      {message || '¡Perfecto!'}
    </p>
  );
};

export default FieldSuccess;
