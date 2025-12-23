// CoverageDisplayV6 - Destacar Cubre: Coberturas grandes, exclusiones pequeñas
'use client';

import React from 'react';
import { Check, X, Shield, Droplet, AlertTriangle, Search, Clock, Headphones } from 'lucide-react';
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

export const CoverageDisplayV6: React.FC<CoverageDisplayProps> = ({
  coverage,
  exclusions,
  className = '',
}) => {
  return (
    <div className={className}>
      {/* Large coverage cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {coverage.map((item) => {
          const Icon = iconMap[item.icon] || Shield;
          return (
            <div
              key={item.name}
              className="bg-white border border-[#03DBD0]/20 rounded-2xl p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#03DBD0]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-7 h-7 text-[#03DBD0]" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-1">{item.name}</h4>
                  <p className="text-sm text-neutral-500 mb-2">{item.description}</p>
                  {item.maxAmount && (
                    <span className="inline-block px-2 py-1 bg-[#03DBD0]/10 text-[#03DBD0] text-xs font-medium rounded">
                      Hasta S/{item.maxAmount.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Small exclusions list */}
      <div className="text-center">
        <p className="text-xs text-neutral-400 mb-2">No cubre: </p>
        <p className="text-xs text-neutral-500">
          {exclusions.join(' • ')}
        </p>
      </div>
    </div>
  );
};

export default CoverageDisplayV6;
