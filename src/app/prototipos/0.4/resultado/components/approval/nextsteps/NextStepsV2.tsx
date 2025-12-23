'use client';

/**
 * NextStepsV2 - Cards individuales
 * Cada paso es una card separada con icono
 */

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { FileText, CreditCard, MapPin, Clock } from 'lucide-react';
import type { NextStep } from '../../../types/approval';

interface NextStepsProps {
  steps: NextStep[];
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  'document': FileText,
  'payment': CreditCard,
  'location': MapPin,
  'time': Clock,
};

export const NextStepsV2: React.FC<NextStepsProps> = ({ steps }) => {
  return (
    <div className="w-full space-y-3">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">
        ¿Qué sigue?
      </h3>

      {steps.map((step, index) => {
        const IconComponent = step.icon ? iconMap[step.icon] : FileText;
        return (
          <Card key={index} className="w-full" isPressable>
            <CardBody className="p-4 flex flex-row items-center gap-4">
              {/* Icono */}
              <div className="flex-shrink-0 w-12 h-12 bg-[#4654CD]/10 rounded-xl flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-[#4654CD]" />
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-neutral-800">{step.title}</h4>
                <p className="text-sm text-neutral-500 truncate">{step.description}</p>
              </div>

              {/* Tiempo */}
              {step.timeEstimate && (
                <span className="flex-shrink-0 text-xs text-neutral-400">
                  {step.timeEstimate}
                </span>
              )}
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};

export default NextStepsV2;
