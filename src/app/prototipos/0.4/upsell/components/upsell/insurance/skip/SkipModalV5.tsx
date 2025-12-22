// SkipModalV5 - Split: riesgos / beneficios continuar
'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';
import { X, Check } from 'lucide-react';

interface SkipModalV5Props {
  isOpen: boolean;
  onClose: () => void;
  onContinueWithoutInsurance: () => void;
  onAddInsurance: () => void;
}

export const SkipModalV5: React.FC<SkipModalV5Props> = ({
  isOpen,
  onClose,
  onContinueWithoutInsurance,
  onAddInsurance,
}) => {
  const risks = [
    'Pagas el costo total de reparaciones',
    'Sin cobertura ante robo o pérdida',
    'Reemplazo de equipo a tu cargo',
    'Riesgo financiero en caso de accidente',
  ];

  const benefits = [
    'Continúas sin costo adicional mensual',
    'Puedes agregar seguro más tarde',
    'Menor cuota mensual inicial',
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Continuar sin protección
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Risks */}
            <div className="border border-red-200 rounded-lg p-4 bg-red-50/30">
              <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                <X className="w-5 h-5 text-red-500" />
                Sin seguro
              </h3>
              <ul className="space-y-2">
                {risks.map((risk, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-neutral-600">
                    <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div className="border border-green-200 rounded-lg p-4 bg-green-50/30">
              <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Continuar así
              </h3>
              <ul className="space-y-2">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-neutral-600">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-sm text-neutral-500 text-center mt-4">
            Tú decides qué es mejor para ti
          </p>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SkipModalV5;
