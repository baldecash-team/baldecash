'use client';

/**
 * NextStepsV4 - Timeline vertical conectado
 * Pasos conectados con línea visual tipo timeline
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { NextStep } from '../../../types/approval';

interface NextStepsProps {
  steps: NextStep[];
}

export const NextStepsV4: React.FC<NextStepsProps> = ({ steps }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-neutral-800 mb-6">
        Tu plan de acción
      </h3>

      <div className="relative">
        {/* Línea vertical conectora */}
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-[#4654CD] to-[#03DBD0]" />

        <div className="space-y-0">
          {steps.map((step, index) => (
            <div key={index} className="relative flex gap-6 pb-8 last:pb-0">
              {/* Círculo en la línea */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-10 h-10 bg-white border-2 border-[#4654CD] rounded-full flex items-center justify-center">
                  {index === 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <span className="text-sm font-bold text-[#4654CD]">{index + 1}</span>
                  )}
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-neutral-800">{step.title}</h4>
                  {index === 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Completado
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-500 mt-1">{step.description}</p>
                {step.timeEstimate && (
                  <p className="text-xs text-neutral-400 mt-2">{step.timeEstimate}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NextStepsV4;
