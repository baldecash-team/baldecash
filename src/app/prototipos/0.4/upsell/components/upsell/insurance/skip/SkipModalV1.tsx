// SkipModalV1 - Persuasivo suave: "¿Estás seguro?"
'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';
import { AlertCircle } from 'lucide-react';

interface SkipModalV1Props {
  isOpen: boolean;
  onClose: () => void;
  onContinueWithoutInsurance: () => void;
  onAddInsurance: () => void;
}

export const SkipModalV1: React.FC<SkipModalV1Props> = ({
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
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span>¿Estás seguro?</span>
          </div>
        </ModalHeader>
        <ModalBody className="pb-6">
          <p className="text-neutral-600 mb-4">
            Sin un plan de protección, cualquier daño o accidente sería tu responsabilidad.
            Considera que una reparación puede costar más que el seguro anual.
          </p>
          <p className="text-sm text-neutral-500">
            Con nuestros planes, estás cubierto ante imprevistos.
          </p>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SkipModalV1;
