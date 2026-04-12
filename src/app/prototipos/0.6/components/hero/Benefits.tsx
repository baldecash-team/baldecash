'use client';

/**
 * Benefits - Grid de beneficios con iconos dinámicos
 * Usado principalmente en landings de convenio institucional
 * Colores dinámicos via CSS variable --color-primary
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { BenefitsData } from '../../types/hero';

interface BenefitsProps {
  data: BenefitsData;
}

export const Benefits: React.FC<BenefitsProps> = ({ data }) => {
  if (!data.benefits || data.benefits.length === 0) return null;

  return (
    <div className="py-12 sm:py-16 md:py-20 lg:py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 font-['Baloo_2',_sans-serif] leading-tight" style={{ color: 'var(--color-primary, #4654CD)' }}>
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {data.benefits.map((benefit, index) => {
            const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[benefit.icon] || LucideIcons.Shield;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 sm:mb-4"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)' }}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: 'var(--color-primary, #4654CD)' }} />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-neutral-800 mb-1.5 sm:mb-2">
                  {benefit.title}
                </h3>
                <p className="text-neutral-600 text-xs sm:text-sm">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Benefits;
