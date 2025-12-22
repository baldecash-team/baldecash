// SkipModalV6 - Impacto: "Tu laptop no estará protegida"
'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';
import { ShieldOff, AlertTriangle } from 'lucide-react';

interface SkipModalV6Props {
  isOpen: boolean;
  onClose: () => void;
  onContinueWithoutInsurance: () => void;
  onAddInsurance: () => void;
  productName?: string;
}

export const SkipModalV6: React.FC<SkipModalV6Props> = ({
  isOpen,
  onClose,
  onContinueWithoutInsurance,
  onAddInsurance,
  productName = 'tu laptop',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="w-full flex justify-center mb-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldOff className="w-10 h-10 text-red-600" />
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="pb-8 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">
            Tu laptop NO estará protegida
          </h2>

          <p className="text-base text-neutral-600 mb-6">
            Sin un plan de protección, {productName} queda expuesta a:
          </p>

          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold text-neutral-800">Reparaciones costosas</h4>
                  <p className="text-sm text-neutral-600">
                    Hasta S/1,500 por pantalla rota o daños internos
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold text-neutral-800">Pérdida total ante robo</h4>
                  <p className="text-sm text-neutral-600">
                    Sin reembolso ni reemplazo del equipo
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold text-neutral-800">Accidentes inesperados</h4>
                  <p className="text-sm text-neutral-600">
                    Derrames de líquidos, caídas, daños eléctricos
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-lg font-semibold text-neutral-800">
            ¿Estás seguro de continuar sin protección?
          </p>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SkipModalV6;
