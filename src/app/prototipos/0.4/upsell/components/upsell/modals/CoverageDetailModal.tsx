'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from '@nextui-org/react';
import { Check, X, Shield, Info } from 'lucide-react';
import type { InsurancePlan } from '../../../types/upsell';

interface CoverageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: InsurancePlan | null;
  onSelectPlan?: (planId: string) => void;
}

/**
 * CoverageDetailModal - Detailed view of insurance plan coverage
 * Shows complete coverage information, exclusions, and terms
 */
export const CoverageDetailModal: React.FC<CoverageDetailModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSelectPlan,
}) => {
  if (!plan) return null;

  const handleSelect = () => {
    if (onSelectPlan) {
      onSelectPlan(plan.id);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4654CD]/10 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#4654CD]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">{plan.name}</h2>
                <p className="text-sm text-neutral-500 font-normal">
                  Detalles de cobertura
                </p>
              </div>
            </div>
            {plan.isRecommended && (
              <Chip
                size="sm"
                classNames={{
                  base: 'bg-[#03DBD0]',
                  content: 'text-white font-semibold text-xs',
                }}
              >
                Recomendado
              </Chip>
            )}
          </div>
        </ModalHeader>

        <ModalBody>
          {/* Pricing */}
          <div className="bg-gradient-to-br from-[#4654CD]/5 to-[#03DBD0]/5 rounded-lg p-4 mb-4">
            <div className="flex items-baseline gap-3">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Pago mensual</p>
                <p className="text-3xl font-bold text-[#4654CD]">
                  S/{plan.monthlyPrice}
                  <span className="text-base text-neutral-500 font-normal">/mes</span>
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-neutral-600 mb-1">Pago anual</p>
                <p className="text-xl font-bold text-neutral-700">
                  S/{plan.yearlyPrice}
                  <span className="text-sm text-neutral-500 font-normal">/año</span>
                </p>
              </div>
            </div>
          </div>

          {/* Coverage */}
          <div className="mb-4">
            <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              ¿Qué cubre?
            </h3>
            <div className="space-y-3">
              {plan.coverage.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 p-3 bg-green-50/50 rounded-lg border border-green-100"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-800 mb-1">
                      {item.name}
                    </h4>
                    <p className="text-sm text-neutral-600">
                      {item.description}
                    </p>
                    {item.maxAmount && (
                      <p className="text-xs text-neutral-500 mt-1">
                        Hasta S/{item.maxAmount.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          <div className="mb-4">
            <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
              <X className="w-5 h-5 text-red-600" />
              ¿Qué NO cubre?
            </h3>
            <div className="space-y-2">
              {plan.exclusions.map((exclusion, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 text-sm text-neutral-600 p-2 bg-neutral-50 rounded"
                >
                  <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{exclusion}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-neutral-800 mb-1">
                  Información importante
                </h4>
                <ul className="text-sm text-neutral-600 space-y-1">
                  <li>• Cobertura válida en todo el Perú</li>
                  <li>• Activación inmediata al aprobar el crédito</li>
                  <li>• Proceso de reclamo 100% digital</li>
                  <li>• Respuesta en menos de 48 horas</li>
                </ul>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="light"
            onPress={onClose}
            className="cursor-pointer"
          >
            Cerrar
          </Button>
          {onSelectPlan && (
            <Button
              className="bg-[#4654CD] text-white cursor-pointer"
              onPress={handleSelect}
            >
              Seleccionar este plan
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CoverageDetailModal;
