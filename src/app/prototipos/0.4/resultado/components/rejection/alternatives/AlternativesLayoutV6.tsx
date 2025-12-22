'use client';

import React from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { Laptop, Wallet, Users, Calendar, ArrowRight } from 'lucide-react';
import type { RejectionAlternative } from '../../../types/rejection';

/**
 * AlternativesLayoutV6 - Cards hero
 * Una alternativa por sección, máximo impacto
 * Experiencia tipo wizard
 */

interface AlternativesLayoutProps {
  alternatives: RejectionAlternative[];
  onSelect?: (alternative: RejectionAlternative) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Laptop: <Laptop className="w-8 h-8" />,
  Wallet: <Wallet className="w-8 h-8" />,
  Users: <Users className="w-8 h-8" />,
  Calendar: <Calendar className="w-8 h-8" />,
};

export const AlternativesLayoutV6: React.FC<AlternativesLayoutProps> = ({ alternatives, onSelect }) => {
  return (
    <div className="mb-8">
      <h2 className="font-semibold text-xl text-neutral-800 text-center mb-6">
        Tienes opciones
      </h2>

      <div className="space-y-6">
        {alternatives.map((alt, index) => (
          <Card
            key={alt.id}
            className={`border-2 ${index === 0 ? 'border-[#4654CD]' : 'border-neutral-200'}`}
          >
            <CardBody className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl ${index === 0 ? 'bg-[#4654CD]' : 'bg-neutral-100'} flex items-center justify-center ${index === 0 ? 'text-white' : 'text-neutral-500'} flex-shrink-0`}>
                  {iconMap[alt.icon]}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    {index === 0 && (
                      <span className="text-xs bg-[#4654CD] text-white px-2 py-0.5 rounded-full">
                        Recomendado
                      </span>
                    )}
                    <h3 className="font-bold text-lg text-neutral-800">{alt.title}</h3>
                  </div>
                  <p className="text-neutral-600">{alt.description}</p>
                </div>

                {alt.action && (
                  <Button
                    color={index === 0 ? 'primary' : 'default'}
                    variant={index === 0 ? 'solid' : 'bordered'}
                    endContent={<ArrowRight className="w-4 h-4" />}
                    className={`${index === 0 ? 'bg-[#4654CD]' : 'border-neutral-300'} cursor-pointer`}
                    onPress={() => onSelect?.(alt)}
                  >
                    {alt.action.label}
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
