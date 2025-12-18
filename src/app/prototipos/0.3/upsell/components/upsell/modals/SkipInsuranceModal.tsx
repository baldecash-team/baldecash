'use client';

/**
 * SkipInsuranceModal - Modal de confirmacion sin seguro
 *
 * E.7: Tono persuasivo / neutral / ultima oferta
 * E.8: Botones simetricos / destacar agregar / link continuar
 */

import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { UpsellConfig, InsurancePlan } from '../../../types/upsell';

interface SkipInsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSkip: () => void;
  onSelectPlan: (planId: string) => void;
  recommendedPlan?: InsurancePlan;
  config: UpsellConfig;
}

const getModalContent = (
  tone: UpsellConfig['skipModalTone'],
  recommendedPlan?: InsurancePlan
) => {
  switch (tone) {
    case 'persuasive':
      return {
        title: 'Estas seguro?',
        message:
          'Sin seguro, cualquier accidente o robo te costaria mucho mas. Protege tu inversion por solo',
        highlight: recommendedPlan
          ? `S/${recommendedPlan.monthlyPrice}/mes`
          : 'un pequeno monto mensual',
        icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
      };
    case 'neutral':
      return {
        title: 'Continuar sin seguro',
        message:
          'Tu laptop no estara protegida contra accidentes, robos u otros imprevistos.',
        highlight: null,
        icon: <Shield className="w-12 h-12 text-neutral-400" />,
      };
    case 'last_offer':
      return {
        title: 'Ultima oportunidad',
        message: 'Por tiempo limitado, te ofrecemos el primer mes gratis de',
        highlight: recommendedPlan?.name || 'nuestro plan recomendado',
        icon: <Shield className="w-12 h-12 text-[#4654CD]" />,
      };
    default:
      return {
        title: 'Continuar sin seguro',
        message: 'Tu laptop no estara protegida.',
        highlight: null,
        icon: <Shield className="w-12 h-12 text-neutral-400" />,
      };
  }
};

export const SkipInsuranceModal: React.FC<SkipInsuranceModalProps> = ({
  isOpen,
  onClose,
  onConfirmSkip,
  onSelectPlan,
  recommendedPlan,
  config,
}) => {
  const content = getModalContent(config.skipModalTone, recommendedPlan);

  const renderButtons = () => {
    switch (config.modalButtonStyle) {
      case 'symmetric':
        // V1: Both buttons equal
        return (
          <>
            <Button
              variant="bordered"
              className="flex-1 cursor-pointer"
              onPress={onConfirmSkip}
            >
              Continuar sin seguro
            </Button>
            <Button
              color="primary"
              className="flex-1 bg-[#4654CD] cursor-pointer"
              onPress={() => recommendedPlan && onSelectPlan(recommendedPlan.id)}
            >
              Agregar seguro
            </Button>
          </>
        );
      case 'highlight_add':
        // V2: "Agregar seguro" destacado
        return (
          <>
            <Button
              variant="light"
              className="cursor-pointer text-neutral-500"
              onPress={onConfirmSkip}
            >
              Sin seguro
            </Button>
            <Button
              color="primary"
              size="lg"
              className="flex-1 bg-[#4654CD] cursor-pointer"
              onPress={() => recommendedPlan && onSelectPlan(recommendedPlan.id)}
            >
              <Shield className="w-4 h-4 mr-2" />
              Agregar seguro - S/{recommendedPlan?.monthlyPrice}/mes
            </Button>
          </>
        );
      case 'link_skip':
        // V3: "Continuar sin seguro" as link
        return (
          <div className="flex flex-col gap-3 w-full">
            <Button
              color="primary"
              size="lg"
              className="w-full bg-[#4654CD] cursor-pointer"
              onPress={() => recommendedPlan && onSelectPlan(recommendedPlan.id)}
            >
              Agregar seguro
            </Button>
            <button
              onClick={onConfirmSkip}
              className="text-sm text-neutral-500 hover:text-neutral-700 underline cursor-pointer"
            >
              Continuar sin seguro
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      classNames={{
        backdrop: 'bg-black/50',
        base: 'border border-neutral-200',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex justify-between items-center">
          <span>{content.title}</span>
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={onClose}
            className="cursor-pointer"
          >
            <X className="w-4 h-4" />
          </Button>
        </ModalHeader>

        <ModalBody className="py-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-4">{content.icon}</div>
            <p className="text-neutral-600 mb-2">{content.message}</p>
            {content.highlight && (
              <p className="text-lg font-bold text-[#4654CD] font-['Baloo_2']">
                {content.highlight}
              </p>
            )}

            {/* Show what they would miss - for persuasive tone */}
            {config.skipModalTone === 'persuasive' && recommendedPlan && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg w-full">
                <p className="text-xs text-amber-700 font-medium mb-2">
                  Con {recommendedPlan.name} estarias protegido contra:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {recommendedPlan.coverage.map((item, index) => (
                    <span
                      key={index}
                      className="text-xs bg-white px-2 py-1 rounded text-amber-600"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Special offer for last_offer tone */}
            {config.skipModalTone === 'last_offer' && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg w-full">
                <p className="text-sm text-green-700 font-medium">
                  Oferta especial: Primer mes GRATIS
                </p>
                <p className="text-xs text-green-600">
                  Solo pagas a partir del segundo mes
                </p>
              </div>
            )}
          </motion.div>
        </ModalBody>

        <ModalFooter className="flex gap-2">{renderButtons()}</ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SkipInsuranceModal;
