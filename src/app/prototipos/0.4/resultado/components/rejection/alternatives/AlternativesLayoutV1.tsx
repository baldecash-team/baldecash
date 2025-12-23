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

      <div className="space-y-3">
        {alternatives.map((alt) => (
          <Card
            key={alt.id}
            isPressable={!!alt.action || !!onSelect}
            className="border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-md transition-all cursor-pointer"
            onPress={() => onSelect?.(alt)}
          >
            <CardBody className="flex flex-row items-center gap-4 p-5">
              <div className="w-14 h-14 bg-[#4654CD]/10 rounded-xl flex items-center justify-center text-[#4654CD] flex-shrink-0">
                {iconMap[alt.icon]}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-800">{alt.title}</h3>
                <p className="text-sm text-neutral-600">{alt.description}</p>
              </div>
              {alt.action && (
                <ArrowRight className="w-5 h-5 text-neutral-400" />
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
