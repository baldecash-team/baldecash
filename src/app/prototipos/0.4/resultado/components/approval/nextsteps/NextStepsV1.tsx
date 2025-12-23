'use client';

/**
 * NextStepsV1 - Lista numerada clásica
 * Lista vertical con números grandes y descripciones
 */

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import type { NextStep } from '../../../types/approval';

interface NextStepsProps {
  steps: NextStep[];
}

export const NextStepsV1: React.FC<NextStepsProps> = ({ steps }) => {
  return (
    <Card className="w-full">
      <CardBody className="p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-6">
          Próximos pasos
        </h3>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4">
              {/* Número */}
              <div className="flex-shrink-0 w-10 h-10 bg-[#4654CD] text-white rounded-full flex items-center justify-center font-bold text-lg">
                {index + 1}
              </div>

              {/* Contenido */}
              <div className="flex-1 pt-1">
                <h4 className="font-medium text-neutral-800">{step.title}</h4>
                <p className="text-sm text-neutral-500 mt-1">{step.description}</p>
                {step.timeEstimate && (
                  <p className="text-xs text-[#4654CD] mt-2">{step.timeEstimate}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default NextStepsV1;
