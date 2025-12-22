'use client';

/**
 * NextStepsV5 - Accordion/expandible
 * Pasos que se expanden al hacer clic
 */

import React from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { Clock } from 'lucide-react';
import type { NextStep } from '../../../types/approval';

interface NextStepsProps {
  steps: NextStep[];
}

export const NextStepsV5: React.FC<NextStepsProps> = ({ steps }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">
        Siguientes pasos
      </h3>

      <Accordion
        variant="splitted"
        defaultExpandedKeys={['0']}
        className="px-0"
      >
        {steps.map((step, index) => (
          <AccordionItem
            key={index.toString()}
            aria-label={step.title}
            title={
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-[#4654CD]/10 text-[#4654CD] rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <span className="font-medium">{step.title}</span>
              </div>
            }
            className="border border-neutral-200 rounded-xl mb-2"
          >
            <div className="pb-2">
              <p className="text-sm text-neutral-600">{step.description}</p>
              {step.timeEstimate && (
                <div className="flex items-center gap-1 mt-3 text-xs text-neutral-400">
                  <Clock className="w-3 h-3" />
                  <span>{step.timeEstimate}</span>
                </div>
              )}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default NextStepsV5;
