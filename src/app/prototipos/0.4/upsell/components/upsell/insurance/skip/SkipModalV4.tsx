// SkipModalV4 - Última oferta: "Última oportunidad..."
'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, Chip } from '@nextui-org/react';
import { Zap, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface SkipModalV4Props {
  isOpen: boolean;
  onClose: () => void;
  onContinueWithoutInsurance: () => void;
  onAddInsurance: () => void;
  recommendedPlan?: {
    name: string;
    monthlyPrice: number;
  };
}

export const SkipModalV4: React.FC<SkipModalV4Props> = ({
  isOpen,
  onClose,
  onContinueWithoutInsurance,
  onAddInsurance,
  recommendedPlan,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <Chip
            size="sm"
            startContent={<Zap className="w-3 h-3" />}
            classNames={{
              base: 'bg-amber-500',
              content: 'text-white text-xs font-semibold',
            }}
          >
            Última oportunidad
          </Chip>
          <span className="text-xl">Última oportunidad de proteger tu inversión</span>
        </ModalHeader>
        <ModalBody className="pb-6">
          {recommendedPlan && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-gradient-to-br from-[#4654CD]/5 to-[#03DBD0]/5 rounded-lg p-4 mb-4 border-2 border-[#4654CD]"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-neutral-800">
                  {recommendedPlan.name}
                </h3>
                <TrendingDown className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-[#4654CD] mb-2">
                Solo S/{recommendedPlan.monthlyPrice}/mes
              </p>
              <p className="text-xs text-neutral-500">
                Protección completa contra accidentes, robo y daños
              </p>
            </motion.div>
          )}

          <p className="text-sm text-neutral-600">
            Después de esta pantalla, no podrás agregar un seguro tan fácilmente.
            <strong className="text-neutral-800"> ¿Seguro que quieres continuar sin protección?</strong>
          </p>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SkipModalV4;
