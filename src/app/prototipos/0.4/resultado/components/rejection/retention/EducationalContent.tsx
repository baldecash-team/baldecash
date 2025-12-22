'use client';

import React from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { BookOpen, TrendingUp, CreditCard, Lightbulb, ArrowRight } from 'lucide-react';

interface EducationalContentProps {
  className?: string;
}

/**
 * EducationalContent - Contenido Educativo
 * DEFINIDO: Link a "Cómo mejorar tu perfil crediticio"
 */
export const EducationalContent: React.FC<EducationalContentProps> = ({ className = '' }) => {
  const tips = [
    {
      icon: CreditCard,
      title: 'Historial crediticio',
      description: 'Paga tus deudas a tiempo para construir un buen historial',
    },
    {
      icon: TrendingUp,
      title: 'Capacidad de pago',
      description: 'Mantén tus deudas por debajo del 30% de tus ingresos',
    },
    {
      icon: Lightbulb,
      title: 'Estabilidad laboral',
      description: 'Un empleo estable aumenta tu puntuación crediticia',
    },
  ];

  return (
    <Card className={`border border-neutral-200 ${className}`}>
      <CardBody className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800">Mejora tu perfil crediticio</h3>
            <p className="text-sm text-neutral-500">Tips para aumentar tus posibilidades</p>
          </div>
        </div>

        <div className="space-y-4 mb-5">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-neutral-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-800 text-sm">{tip.title}</p>
                  <p className="text-xs text-neutral-500">{tip.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          variant="light"
          className="w-full text-[#4654CD] font-medium cursor-pointer hover:bg-[#4654CD]/5"
          endContent={<ArrowRight className="w-4 h-4" />}
        >
          Ver guía completa
        </Button>
      </CardBody>
    </Card>
  );
};
