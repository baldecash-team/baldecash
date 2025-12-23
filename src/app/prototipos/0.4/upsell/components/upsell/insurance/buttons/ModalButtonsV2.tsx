// ModalButtonsV2 - "Agregar" primario destacado
'use client';

import React from 'react';
import { Button } from '@nextui-org/react';

interface ModalButtonsV2Props {
  onContinueWithout: () => void;
  onAddInsurance: () => void;
  continueLabel?: string;
  addLabel?: string;
}

export const ModalButtonsV2: React.FC<ModalButtonsV2Props> = ({
  onContinueWithout,
  onAddInsurance,
  continueLabel = 'Continuar sin seguro',
  addLabel = 'Agregar protección',
}) => {
  return (
    <div className="flex gap-3 w-full">
      <Button
        variant="light"
        className="flex-1 text-neutral-600 cursor-pointer"
        onPress={onContinueWithout}
      >
        {continueLabel}
      </Button>
      <Button
        className="flex-1 bg-[#4654CD] text-white cursor-pointer"
        onPress={onAddInsurance}
      >
        {addLabel}
      </Button>
    </div>
  );
};

export default ModalButtonsV2;
