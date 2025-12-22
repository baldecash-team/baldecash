// RemoveButtonV2 - Toggle: Toggle on/off integrado
'use client';

import React from 'react';
import { Switch } from '@nextui-org/react';

interface RemoveButtonProps {
  onRemove: () => void;
  isSelected: boolean;
  className?: string;
}

export const RemoveButtonV2: React.FC<RemoveButtonProps> = ({
  onRemove,
  isSelected,
  className = '',
}) => {
  return (
    <div className={`${className}`}>
      <Switch
        isSelected={isSelected}
        onValueChange={(checked) => {
          if (!checked) onRemove();
        }}
        size="sm"
        color="primary"
        classNames={{
          wrapper: 'group-data-[selected=true]:bg-[#4654CD]',
        }}
      />
    </div>
  );
};
