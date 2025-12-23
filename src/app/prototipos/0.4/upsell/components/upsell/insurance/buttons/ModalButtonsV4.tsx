// ModalButtonsV4 - "Agregar" hover atractivo
'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface ModalButtonsV4Props {
  onContinueWithout: () => void;
  onAddInsurance: () => void;
  continueLabel?: string;
  addLabel?: string;
}

export const ModalButtonsV4: React.FC<ModalButtonsV4Props> = ({
  onContinueWithout,
  onAddInsurance,
  continueLabel = 'Continuar sin seguro',
  addLabel = 'Agregar protección',
}) => {
  return (
    <div className="flex gap-3 w-full">
      <Button
        variant="light"
        className="flex-1 text-neutral-500 cursor-pointer"
        onPress={onContinueWithout}
      >
        {continueLabel}
      </Button>
      <motion.div
        className="flex-1"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          className="w-full bg-gradient-to-r from-[#4654CD] to-[#03DBD0] text-white cursor-pointer"
          startContent={<Shield className="w-4 h-4" />}
          onPress={onAddInsurance}
        >
          {addLabel}
        </Button>
      </motion.div>
    </div>
  );
};

export default ModalButtonsV4;
