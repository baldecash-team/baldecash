'use client';

import React, { useState } from 'react';
import { Accordion, AccordionItem } from '@nextui-org/react';
import { Laptop, Wallet, Users, Calendar, ChevronRight } from 'lucide-react';
import type { RejectionAlternative } from '../../../types/rejection';

/**
 * AlternativesLayoutV3 - Accordion expandible
 * Una alternativa a la vez
 * Experiencia enfocada
 */

interface AlternativesLayoutProps {
  alternatives: RejectionAlternative[];
  onSelect?: (alternative: RejectionAlternative) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Laptop: <Laptop className="w-5 h-5" />,
  Wallet: <Wallet className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
};

export const AlternativesLayoutV3: React.FC<AlternativesLayoutProps> = ({ alternatives, onSelect }) => {
  return (
    <div className="mb-8">
      <h2 className="font-semibold text-lg text-neutral-800 mb-4">¿Qué puedes hacer?</h2>

      <Accordion
        variant="bordered"
        selectionMode="single"
        className="px-0"
      >
        {alternatives.map((alt) => (
          <AccordionItem
            key={alt.id}
            aria-label={alt.title}
            title={
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#4654CD]/10 flex items-center justify-center text-[#4654CD]">
                  {iconMap[alt.icon]}
                </div>
                <span className="font-medium">{alt.title}</span>
              </div>
            }
            classNames={{
              base: 'border-neutral-200',
              trigger: 'py-3 cursor-pointer',
              content: 'pt-0 pb-4',
            }}
          >
            <div className="pl-11">
              <p className="text-sm text-neutral-600 mb-3">{alt.description}</p>
              {alt.action && (
                <button
                  onClick={() => onSelect?.(alt)}
                  className="inline-flex items-center gap-1 text-sm text-[#4654CD] font-medium hover:underline cursor-pointer"
                >
                  {alt.action.label}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
