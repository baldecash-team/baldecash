'use client';

/**
 * NextStepsV3 - Horizontal scrollable
 * Pasos en formato horizontal con scroll en móvil
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { NextStep } from '../../../types/approval';

interface NextStepsProps {
  steps: NextStep[];
}

export const NextStepsV3: React.FC<NextStepsProps> = ({ steps }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">
        Tu camino al éxito
      </h3>

      {/* Scroll container */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step card */}
            <div className="flex-shrink-0 w-48 snap-center bg-white border border-neutral-200 rounded-xl p-4">
              <div className="w-8 h-8 bg-[#4654CD] text-white rounded-lg flex items-center justify-center font-bold text-sm mb-3">
                {index + 1}
              </div>
              <h4 className="font-medium text-neutral-800 text-sm mb-1">{step.title}</h4>
              <p className="text-xs text-neutral-500 line-clamp-2">{step.description}</p>
              {step.timeEstimate && (
                <p className="text-xs text-[#03DBD0] mt-2 font-medium">{step.timeEstimate}</p>
              )}
            </div>

            {/* Connector arrow (except last) */}
            {index < steps.length - 1 && (
              <div className="flex-shrink-0 flex items-center">
                <ArrowRight className="w-4 h-4 text-neutral-300" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default NextStepsV3;
