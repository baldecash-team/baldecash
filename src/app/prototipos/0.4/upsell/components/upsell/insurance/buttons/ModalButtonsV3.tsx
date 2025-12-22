// ModalButtonsV3 - Simétricos con iconos flat
'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { X, Shield } from 'lucide-react';

interface ModalButtonsV3Props {
  onContinueWithout: () => void;
  onAddInsurance: () => void;
  continueLabel?: string;
  addLabel?: string;
}

export const ModalButtonsV3: React.FC<ModalButtonsV3Props> = ({
  onContinueWithout,
  onAddInsurance,
  continueLabel = 'Continuar sin seguro',
  addLabel = 'Agregar protección',
}) => {
  return (
    <div className="flex gap-3 w-full">
      <Button
        variant="bordered"
        className="flex-1 border-neutral-300 cursor-pointer"
        startContent={<X className="w-4 h-4" />}
        onPress={onContinueWithout}
      >
        {continueLabel}
      </Button>
      <Button
        variant="bordered"
        className="flex-1 border-neutral-300 cursor-pointer"
        startContent={<Shield className="w-4 h-4" />}
        onPress={onAddInsurance}
      >
        {addLabel}
      </Button>
    </div>
  );
};

export default ModalButtonsV3;
