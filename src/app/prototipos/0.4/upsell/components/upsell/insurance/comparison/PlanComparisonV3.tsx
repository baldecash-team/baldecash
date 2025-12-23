'use client';

import React, { useState } from 'react';
import { Slider, Button } from '@nextui-org/react';
import { Shield, ShieldCheck, ShieldPlus } from 'lucide-react';
import type { InsurancePlan } from '../../../../types/upsell';

interface PlanComparisonV3Props {
  plans: InsurancePlan[];
  selectedPlan: string | null;
  onSelect: (planId: string) => void;
}

/**
 * PlanComparisonV3 - Slider de cobertura
 * Vista de slider de menor a mayor protección
 */
export const PlanComparisonV3: React.FC<PlanComparisonV3Props> = ({
  plans,
  selectedPlan,
  onSelect,
}) => {
  const [sliderValue, setSliderValue] = useState(
    selectedPlan ? plans.findIndex(p => p.id === selectedPlan) : 1
  );

  const currentPlan = plans[sliderValue];
  const icons = [Shield, ShieldCheck, ShieldPlus];
  const Icon = icons[sliderValue] || Shield;

  return (
    <div className="bg-neutral-50 rounded-xl p-6">
      {/* Slider */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-neutral-500 mb-2">
          <span>Básica</span>
          <span>Premium</span>
        </div>
        <Slider
          size="lg"
          step={1}
          minValue={0}
          maxValue={plans.length - 1}
          value={sliderValue}
          onChange={(val) => setSliderValue(val as number)}
          classNames={{
            base: 'max-w-full',
            filler: 'bg-[#4654CD]',
            thumb: 'bg-white border-2 border-[#4654CD] w-6 h-6 shadow-lg cursor-pointer',
            track: 'bg-neutral-200 h-2',
          }}
        />
      </div>

      {/* Current plan display */}
      {currentPlan && (
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#4654CD]/10 rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6 text-[#4654CD]" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-800">{currentPlan.name}</h3>
              <p className="text-2xl font-bold text-[#4654CD]">
                S/{currentPlan.monthlyPrice}/mes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {currentPlan.coverage.map((item) => (
              <div key={item.name} className="text-sm text-neutral-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
                {item.name}
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-[#4654CD] text-white cursor-pointer hover:bg-[#3a47b3]"            onPress={() => onSelect(currentPlan.id)}
          >
            {selectedPlan === currentPlan.id ? 'Plan seleccionado' : 'Seleccionar este plan'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlanComparisonV3;
