'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { Laptop, Wallet, Users, Calendar, ArrowRight } from 'lucide-react';
import type { RejectionAlternative } from '../../../types/rejection';

/**
 * AlternativesLayoutV1 - Cards grandes
 * Iconos prominentes y CTA claro
 * Impacto visual máximo
 */

interface AlternativesLayoutProps {
  alternatives: RejectionAlternative[];
  onSelect?: (alternative: RejectionAlternative) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Laptop: <Laptop className="w-6 h-6" />,
  Wallet: <Wallet className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  Calendar: <Calendar className="w-6 h-6" />,
};

export const AlternativesLayoutV1: React.FC<AlternativesLayoutProps> = ({ alternatives, onSelect }) => {
  return (
    <div className="space-y-4 mb-8">
      <h2 className="font-semibold text-lg text-neutral-800">¿Qué puedes hacer?</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {alternatives.map((alt) => (
          <Card
            key={alt.id}
            isPressable={!!alt.action || !!onSelect}
            className="border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-md transition-all cursor-pointer"
            onPress={() => onSelect?.(alt)}
          >
            <CardBody className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4654CD]/10 rounded-xl flex items-center justify-center text-[#4654CD] flex-shrink-0">
                  {iconMap[alt.icon]}
                </div>
                <h3 className="font-semibold text-neutral-800 text-sm">{alt.title}</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">{alt.description}</p>
              {alt.action && (
                <div className="flex items-center gap-1 text-xs text-[#4654CD] font-medium mt-auto">
                  {alt.action.label || 'Ver más'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
