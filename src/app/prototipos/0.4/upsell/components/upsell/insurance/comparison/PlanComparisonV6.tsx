'use client';

import React from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { Check, X, Star } from 'lucide-react';
import type { InsurancePlan } from '../../../../types/upsell';

interface PlanComparisonV6Props {
  plans: InsurancePlan[];
  selectedPlan: string | null;
  onSelect: (planId: string) => void;
}

/**
 * PlanComparisonV6 - Cards gigantes apiladas
 * Vista de detalle máximo, una tarjeta por fila
 */
export const PlanComparisonV6: React.FC<PlanComparisonV6Props> = ({
  plans,
  selectedPlan,
  onSelect,
}) => {
  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`transition-all ${
            selectedPlan === plan.id
              ? 'border-2 border-[#4654CD] bg-[#4654CD]/5'
              : 'border border-neutral-200'
          }`}
        >
          <CardBody className="p-0">
            <div className="flex flex-col md:flex-row">
              {/* Left: Plan info */}
              <div className="p-6 md:w-1/3 md:border-r border-b md:border-b-0 border-neutral-200">
                <div className="flex items-center gap-2 mb-3">
                  {plan.isRecommended && (
                    <Chip
                      size="sm"
                      radius="sm"
                      startContent={<Star className="w-3 h-3 fill-current" />}
                      classNames={{
                        base: 'bg-[#4654CD] px-2 py-0.5 h-auto',
                        content: 'text-white text-xs font-medium',
                      }}
                    >
                      Recomendado
                    </Chip>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#4654CD]">S/{plan.monthlyPrice}</span>
                  <span className="text-neutral-500">/mes</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  S/{plan.yearlyPrice}/año si pagas anual
                </p>
              </div>

              {/* Middle: Coverage */}
              <div className="p-6 md:flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {plan.coverage.map((item) => (
                    <div key={item.name} className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-[#22c55e]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-[#22c55e]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800">{item.name}</p>
                        <p className="text-xs text-neutral-500">{item.description}</p>
                      </div>
                    </div>
                  ))}
                  {plan.exclusions.map((exc) => (
                    <div key={exc} className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <X className="w-4 h-4 text-neutral-400" />
                      </div>
                      <span className="text-sm text-neutral-400">{exc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Action */}
              <div className="p-6 md:w-48 flex items-center justify-center bg-neutral-50/50">
                <Button
                  size="lg"
                  className={`w-full cursor-pointer ${
                    selectedPlan === plan.id
                      ? 'bg-[#22c55e] text-white'
                      : 'bg-[#4654CD] text-white hover:bg-[#3a47b3]'
                  }`}
                  onPress={() => onSelect(plan.id)}
                >
                  {selectedPlan === plan.id ? 'Seleccionado' : 'Seleccionar'}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};

export default PlanComparisonV6;
