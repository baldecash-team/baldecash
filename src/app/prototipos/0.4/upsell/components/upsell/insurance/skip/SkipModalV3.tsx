// SkipModalV3 - Informativo + ilustración
'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';
import { Laptop, X } from 'lucide-react';

interface SkipModalV3Props {
  isOpen: boolean;
  onClose: () => void;
  onContinueWithoutInsurance: () => void;
  onAddInsurance: () => void;
}

export const SkipModalV3: React.FC<SkipModalV3Props> = ({
  isOpen,
  onClose,
  onContinueWithoutInsurance,
  onAddInsurance,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Sin protección adicional
        </ModalHeader>
        <ModalBody className="pb-6">
          {/* Flat illustration */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 mb-4 flex items-center justify-center">
            <div className="relative">
              <Laptop className="w-20 h-20 text-neutral-400" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-neutral-800 mb-2">
            ¿Sabías que...?
          </h3>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex gap-2">
              <span className="text-neutral-400">•</span>
              <span>1 de cada 4 laptops sufre algún daño en el primer año</span>
            </li>
            <li className="flex gap-2">
              <span className="text-neutral-400">•</span>
              <span>El costo promedio de reparación es de S/800</span>
            </li>
            <li className="flex gap-2">
              <span className="text-neutral-400">•</span>
              <span>Los accidentes más comunes son caídas y derrames</span>
            </li>
          </ul>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SkipModalV3;
