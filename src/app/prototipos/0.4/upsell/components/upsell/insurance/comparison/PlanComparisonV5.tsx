'use client';

import React, { useState } from 'react';
import { Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import { Check, X, Info } from 'lucide-react';
import type { InsurancePlan } from '../../../../types/upsell';

interface PlanComparisonV5Props {
  plans: InsurancePlan[];
  selectedPlan: string | null;
  onSelect: (planId: string) => void;
}

/**
 * PlanComparisonV5 - Split preview + modal tabla
 * Cards simples con modal de detalle completo
 */
export const PlanComparisonV5: React.FC<PlanComparisonV5Props> = ({
  plans,
  selectedPlan,
  onSelect,
}) => {
  const [detailPlan, setDetailPlan] = useState<InsurancePlan | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`h-full ${
              selectedPlan === plan.id
                ? 'border-2 border-[#4654CD]'
                : 'border border-neutral-200'
            }`}
          >
            <CardBody className="p-4">
              {plan.isRecommended && (
                <div className="text-xs font-medium text-[#4654CD] mb-2">
                  Recomendado
                </div>
              )}
              <h3 className="font-semibold text-neutral-800">{plan.name}</h3>
              <p className="text-2xl font-bold text-[#4654CD] my-2">
                S/{plan.monthlyPrice}/mes
              </p>
              <p className="text-xs text-neutral-500 mb-3">
                {plan.coverage.length} coberturas incluidas
              </p>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="light"
                  className="cursor-pointer flex-1"
                  startContent={<Info className="w-4 h-4" />}
                  onPress={() => setDetailPlan(plan)}
                >
                  Ver detalle
                </Button>
                <Button
                  size="sm"
                  className={`cursor-pointer flex-1 ${
                    selectedPlan === plan.id
                      ? 'bg-[#4654CD] text-white'
                      : 'bg-neutral-100'
                  }`}
                  onPress={() => onSelect(plan.id)}
                >
                  {selectedPlan === plan.id ? 'Elegido' : 'Elegir'}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailPlan}
        onClose={() => setDetailPlan(null)}
        size="lg"
        scrollBehavior="outside"
        placement="center"
        classNames={{
          base: 'bg-white',
          closeButton: 'cursor-pointer',
        }}
      >
        <ModalContent>
          {detailPlan && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-lg font-semibold">{detailPlan.name}</span>
                <span className="text-2xl font-bold text-[#4654CD]">
                  S/{detailPlan.monthlyPrice}/mes
                </span>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-2">Incluye:</h4>
                    <div className="space-y-2">
                      {detailPlan.coverage.map((item) => (
                        <div key={item.name} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#22c55e] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-neutral-800">{item.name}</p>
                            <p className="text-xs text-neutral-500">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-2">No incluye:</h4>
                    <div className="space-y-1">
                      {detailPlan.exclusions.map((exc) => (
                        <div key={exc} className="flex items-center gap-2 text-sm text-neutral-500">
                          <X className="w-4 h-4 text-neutral-300" />
                          {exc}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  className="bg-[#4654CD] text-white cursor-pointer w-full"
                  onPress={() => {
                    onSelect(detailPlan.id);
                    setDetailPlan(null);
                  }}
                >
                  Seleccionar {detailPlan.name}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default PlanComparisonV5;
