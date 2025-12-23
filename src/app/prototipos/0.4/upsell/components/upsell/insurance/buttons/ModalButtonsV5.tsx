// ModalButtonsV5 - Vertical: agregar arriba + sin abajo
'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { Shield } from 'lucide-react';

interface ModalButtonsV5Props {
  onContinueWithout: () => void;
  onAddInsurance: () => void;
  continueLabel?: string;
  addLabel?: string;
}

export const ModalButtonsV5: React.FC<ModalButtonsV5Props> = ({
  onContinueWithout,
  onAddInsurance,
  continueLabel = 'Continuar sin seguro',
  addLabel = 'Agregar protección',
}) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <Button
        size="lg"
        className="w-full bg-[#4654CD] text-white cursor-pointer"
        startContent={<Shield className="w-5 h-5" />}
        onPress={onAddInsurance}
      >
        {addLabel}
      </Button>
      <Button
        variant="light"
        className="w-full text-neutral-500 cursor-pointer"
        onPress={onContinueWithout}
      >
        {continueLabel}
      </Button>
    </div>
  );
};

export default ModalButtonsV5;
