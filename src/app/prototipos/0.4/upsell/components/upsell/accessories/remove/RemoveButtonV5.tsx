// RemoveButtonV5 - Quitar Visible: Botón solo visible en seleccionados
'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { Minus } from 'lucide-react';

interface RemoveButtonProps {
  onRemove: () => void;
  isSelected: boolean;
  className?: string;
}

export const RemoveButtonV5: React.FC<RemoveButtonProps> = ({
  onRemove,
  isSelected,
  className = '',
}) => {
  if (!isSelected) return null;

  return (
    <div className={`mt-2 ${className}`}>
      <Button
        size="sm"
        variant="flat"
        color="danger"
        onPress={onRemove}
        className="w-full cursor-pointer"
        startContent={<Minus className="w-4 h-4" />}
      >
        Quitar de mi compra
      </Button>
    </div>
  );
};

export default RemoveButtonV5;
