'use client';

/**
 * LandingBenefitsBar - Barra horizontal de beneficios
 * Configuración fija v0.5
 */

import React from 'react';
import { Truck, Shield, CreditCard, IdCard, LucideIcon } from 'lucide-react';
import { LandingBenefit } from '../../../types/landing';

const iconMap: Record<string, LucideIcon> = {
  Truck,
  Shield,
  CreditCard,
  IdCard,
};

interface LandingBenefitsBarProps {
  benefits: LandingBenefit[];
}

export const LandingBenefitsBar: React.FC<LandingBenefitsBarProps> = ({ benefits }) => {
  return (
    <div className="w-full bg-neutral-50 border-b border-neutral-100 py-3">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {benefits.map((benefit) => {
            const IconComponent = iconMap[benefit.icon] || Shield;
            return (
              <div
                key={benefit.id}
                className="flex items-center gap-2 text-neutral-600"
              >
                <IconComponent className="w-4 h-4 text-[#4654CD]" />
                <span className="text-xs sm:text-sm font-medium">{benefit.texto}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LandingBenefitsBar;
