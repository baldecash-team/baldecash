'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { Laptop, Wallet, Users, Calendar, ArrowRight } from 'lucide-react';
import type { RejectionAlternative } from '../../../types/rejection';

/**
 * AlternativesLayoutV4 - Cards animadas
 * Hover atractivo estilo fintech
 * Transiciones suaves y modernas
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

export const AlternativesLayoutV4: React.FC<AlternativesLayoutProps> = ({ alternatives, onSelect }) => {
  return (
    <div className="mb-8">
      <h2 className="font-semibold text-lg text-neutral-800 mb-4">Tus opciones</h2>

      <div className="grid gap-3">
        {alternatives.map((alt) => (
          <Card
            key={alt.id}
            isPressable
            className="border border-neutral-100 hover:border-[#4654CD] hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onPress={() => onSelect?.(alt)}
          >
            <CardBody className="flex flex-row items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 group-hover:bg-[#4654CD] flex items-center justify-center text-neutral-500 group-hover:text-white transition-all duration-300 flex-shrink-0">
                {iconMap[alt.icon]}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-neutral-800 group-hover:text-[#4654CD] transition-colors">
                  {alt.title}
                </h3>
                <p className="text-sm text-neutral-500">{alt.description}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-transparent group-hover:bg-[#4654CD]/10 flex items-center justify-center transition-all duration-300">
                <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#4654CD] transition-colors" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
