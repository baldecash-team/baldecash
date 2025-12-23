// SkipModalV2 - Neutral: "Entendido, continuar"
'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';
import { Info } from 'lucide-react';

interface SkipModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  onContinueWithoutInsurance: () => void;
  onAddInsurance: () => void;
}

export const SkipModalV2: React.FC<SkipModalV2Props> = ({
  isOpen,
  onClose,
  onContinueWithoutInsurance,
  onAddInsurance,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-[#4654CD]" />
            <span>Continuar sin protección</span>
          </div>
        </ModalHeader>
        <ModalBody className="pb-6">
          <p className="text-neutral-600 mb-3">
            Has decidido continuar sin un plan de protección.
          </p>
          <p className="text-sm text-neutral-500">
            Recuerda que siempre puedes agregar un seguro más adelante
            contactando a nuestro equipo de soporte.
          </p>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SkipModalV2;
