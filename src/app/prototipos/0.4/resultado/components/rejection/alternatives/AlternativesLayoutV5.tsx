'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { Laptop, Wallet, Users, Calendar, ArrowRight, ChevronRight } from 'lucide-react';
import type { RejectionAlternative } from '../../../types/rejection';

/**
 * AlternativesLayoutV5 - Split
 * Principales en cards + resto en lista
 * Jerarquía visual clara
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

export const AlternativesLayoutV5: React.FC<AlternativesLayoutProps> = ({ alternatives, onSelect }) => {
  // Primeras 2 alternativas como principales
  const mainAlternatives = alternatives.slice(0, 2);
  const secondaryAlternatives = alternatives.slice(2);

  return (
    <div className="mb-8">
      {/* Alternativas principales */}
      <h2 className="font-semibold text-lg text-neutral-800 mb-4">Opciones recomendadas</h2>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {mainAlternatives.map((alt) => (
          <Card
            key={alt.id}
            isPressable
            className="border-2 border-[#4654CD]/20 hover:border-[#4654CD] hover:shadow-md transition-all cursor-pointer"
            onPress={() => onSelect?.(alt)}
          >
            <CardBody className="p-4">
              <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center text-[#4654CD] mb-3">
                {iconMap[alt.icon]}
              </div>
              <h3 className="font-semibold text-neutral-800 mb-1">{alt.title}</h3>
              <p className="text-sm text-neutral-600 mb-3">{alt.description}</p>
              {alt.action && (
                <div className="flex items-center gap-1 text-sm text-[#4654CD] font-medium">
                  {alt.action.label}
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Alternativas secundarias */}
      {secondaryAlternatives.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-neutral-500 mb-3">Otras opciones</h3>
          <ul className="space-y-2">
            {secondaryAlternatives.map((alt) => (
              <li key={alt.id}>
                <button
                  onClick={() => onSelect?.(alt)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                    {iconMap[alt.icon]}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-neutral-700">{alt.title}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
