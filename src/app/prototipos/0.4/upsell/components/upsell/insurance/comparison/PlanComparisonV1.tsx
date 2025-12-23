'use client';

import React from 'react';
import { Card, CardBody, Chip, Button } from '@nextui-org/react';
import { Check, X } from 'lucide-react';
import type { InsurancePlan } from '../../../../types/upsell';

interface PlanComparisonV1Props {
  plans: InsurancePlan[];
  selectedPlan: string | null;
  onSelect: (planId: string) => void;
}

/**
 * PlanComparisonV1 - Cards lado a lado (e-commerce)
 * Estilo clásico de comparación de productos
 */
export const PlanComparisonV1: React.FC<PlanComparisonV1Props> = ({
  plans,
  selectedPlan,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          isPressable
          onPress={() => onSelect(plan.id)}
          className={`transition-all cursor-pointer h-full ${
            selectedPlan === plan.id
              ? 'border-2 border-[#4654CD] bg-[#4654CD]/5'
              : 'border border-neutral-200 hover:border-[#4654CD]/50'
          } ${plan.isRecommended ? 'ring-2 ring-[#4654CD]/20' : ''}`}
        >
          <CardBody className="p-4">
            {plan.isRecommended && (
              <Chip
                size="sm"
                radius="sm"
                classNames={{
                  base: 'bg-[#4654CD] px-2 py-0.5 h-auto mb-3',
                  content: 'text-white text-xs font-medium',
                }}
              >
                Recomendado
              </Chip>
            )}

            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              {plan.name}
            </h3>

            <p className="text-2xl font-bold text-[#4654CD] mb-4">
              S/{plan.monthlyPrice}<span className="text-sm font-normal text-neutral-500">/mes</span>
            </p>

            {/* Coverage list */}
            <div className="space-y-2 mb-4">
              {plan.coverage.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                  <span className="text-neutral-700">{item.name}</span>
                </div>
              ))}
              {plan.exclusions.slice(0, 2).map((exclusion) => (
                <div key={exclusion} className="flex items-center gap-2 text-sm">
                  <X className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                  <span className="text-neutral-400 line-through">{exclusion}</span>
                </div>
              ))}
            </div>

            <Button
              className={`w-full cursor-pointer ${
                selectedPlan === plan.id
                  ? 'bg-[#4654CD] text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
              onPress={() => onSelect(plan.id)}
            >
              {selectedPlan === plan.id ? 'Seleccionado' : 'Seleccionar'}
            </Button>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default PlanComparisonV1;
