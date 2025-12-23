// RemoveButtonV1 - X Esquina: Botón X pequeño esquina superior
'use client';

import React from 'react';
import { X } from 'lucide-react';

interface RemoveButtonProps {
  onRemove: () => void;
  isSelected: boolean;
  className?: string;
}

export const RemoveButtonV1: React.FC<RemoveButtonProps> = ({
  onRemove,
  isSelected,
  className = '',
}) => {
  if (!isSelected) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      className={`absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-neutral-900/80 text-white flex items-center justify-center hover:bg-neutral-900 transition-colors cursor-pointer ${className}`}
    >
      <X className="w-4 h-4" />
    </button>
  );
};

export default RemoveButtonV1;
