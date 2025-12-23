// ModalButtonsV6 - "Agregar" gigante, "Sin" link pequeño
'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { Shield } from 'lucide-react';

interface ModalButtonsV6Props {
  onContinueWithout: () => void;
  onAddInsurance: () => void;
  continueLabel?: string;
  addLabel?: string;
}

export const ModalButtonsV6: React.FC<ModalButtonsV6Props> = ({
  onContinueWithout,
  onAddInsurance,
  continueLabel = 'Continuar sin seguro',
  addLabel = 'Agregar protección',
}) => {
  return (
    <div className="flex flex-col gap-4 w-full items-center">
      <Button
        size="lg"
        className="w-full h-16 bg-[#4654CD] text-white text-lg font-semibold cursor-pointer"
        startContent={<Shield className="w-6 h-6" />}
        onPress={onAddInsurance}
      >
        {addLabel}
      </Button>
      <button
        onClick={onContinueWithout}
        className="text-sm text-neutral-400 hover:text-neutral-600 underline cursor-pointer"
      >
        {continueLabel}
      </button>
    </div>
  );
};

export default ModalButtonsV6;
