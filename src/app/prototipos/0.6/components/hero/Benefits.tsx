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
    <div className="py-16 md:py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Baloo_2']" style={{ color: 'var(--color-primary, #4654CD)' }}>
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-neutral-600 max-w-2xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.benefits.map((benefit, index) => {
            const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[benefit.icon] || LucideIcons.Shield;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary, #4654CD) 10%, transparent)' }}
                >
                  <Icon className="w-7 h-7" style={{ color: 'var(--color-primary, #4654CD)' }} />
                </div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-neutral-600 text-sm">
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
