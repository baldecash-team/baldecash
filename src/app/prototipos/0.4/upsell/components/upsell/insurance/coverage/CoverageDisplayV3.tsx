// CoverageDisplayV3 - Iconos Flat: Verde incluido, gris excluido
'use client';

import React from 'react';
import { Shield, Droplet, AlertTriangle, Search, Clock, Headphones, X } from 'lucide-react';
import { CoverageItem } from '../../../../types/upsell';

interface CoverageDisplayProps {
  coverage: CoverageItem[];
  exclusions: string[];
  className?: string;
}

const iconMap: Record<string, React.ElementType> = {
  Shield: Shield,
  Droplet: Droplet,
  AlertTriangle: AlertTriangle,
  Search: Search,
  Clock: Clock,
  Headphones: Headphones,
};

export const CoverageDisplayV3: React.FC<CoverageDisplayProps> = ({
  coverage,
  exclusions,
  className = '',
}) => {
  return (
    <div className={`${className}`}>
      {/* Coverage icons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {coverage.map((item) => {
          const Icon = iconMap[item.icon] || Shield;
          return (
            <div
              key={item.name}
              className="flex items-center gap-3 p-3 bg-[#03DBD0]/5 rounded-xl"
            >
              <div className="w-10 h-10 rounded-lg bg-[#03DBD0]/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#03DBD0]" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                {item.maxAmount && (
                  <p className="text-xs text-neutral-500">Hasta S/{item.maxAmount}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Exclusions as chips */}
      <div className="flex flex-wrap gap-2">
        {exclusions.map((exclusion) => (
          <span
            key={exclusion}
            className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 text-neutral-500 text-xs rounded"
          >
            <X className="w-3 h-3" />
            {exclusion}
          </span>
        ))}
      </div>
    </div>
  );
};
