'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { Check, X } from 'lucide-react';
import type { InsurancePlan } from '../../../../types/upsell';

interface PlanComparisonV2Props {
  plans: InsurancePlan[];
  selectedPlan: string | null;
  onSelect: (planId: string) => void;
}

/**
 * PlanComparisonV2 - Tabla comparativa checks/X
 * Vista de tabla para fácil comparación
 */
export const PlanComparisonV2: React.FC<PlanComparisonV2Props> = ({
  plans,
  selectedPlan,
  onSelect,
}) => {
  // Get all unique features
  const allFeatures = ['Robo', 'Daños accidentales', 'Daños por líquidos', 'Pérdida', 'Extensión de garantía', 'Daño de pantalla'];

  const planHasFeature = (plan: InsurancePlan, feature: string) => {
    return plan.coverage.some(c => c.name.toLowerCase().includes(feature.toLowerCase()) || c.description.toLowerCase().includes(feature.toLowerCase()));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-3 bg-neutral-50">Cobertura</th>
            {plans.map((plan) => (
              <th key={plan.id} className="p-3 bg-neutral-50 text-center min-w-[140px]">
                <div className="font-semibold text-neutral-800">{plan.name}</div>
                <div className="text-[#4654CD] font-bold text-lg">S/{plan.monthlyPrice}/mes</div>
                {plan.isRecommended && (
                  <div className="text-xs text-[#4654CD] font-medium mt-1">Recomendado</div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((feature, idx) => (
            <tr key={feature} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}>
              <td className="p-3 text-sm text-neutral-700">{feature}</td>
              {plans.map((plan) => (
                <td key={plan.id} className="p-3 text-center">
                  {planHasFeature(plan, feature) ? (
                    <Check className="w-5 h-5 text-[#22c55e] mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-neutral-300 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t border-neutral-200">
            <td className="p-3"></td>
            {plans.map((plan) => (
              <td key={plan.id} className="p-3 text-center">
                <Button
                  size="sm"
                  className={`cursor-pointer ${
                    selectedPlan === plan.id
                      ? 'bg-[#4654CD] text-white'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                  onPress={() => onSelect(plan.id)}
                >
                  {selectedPlan === plan.id ? 'Seleccionado' : 'Elegir'}
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PlanComparisonV2;
