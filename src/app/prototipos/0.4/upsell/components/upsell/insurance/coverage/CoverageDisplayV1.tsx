// CoverageDisplayV1 - Checks/X: Lista con checks verdes y X rojas
'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { CoverageItem } from '../../../../types/upsell';

interface CoverageDisplayProps {
  coverage: CoverageItem[];
  exclusions: string[];
  className?: string;
}

export const CoverageDisplayV1: React.FC<CoverageDisplayProps> = ({
  coverage,
  exclusions,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Coverage */}
      <div className="space-y-2">
        {coverage.map((item) => (
          <div key={item.name} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#03DBD0] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-neutral-900">{item.name}</p>
              <p className="text-xs text-neutral-500">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Exclusions */}
      <div className="border-t border-neutral-100 pt-3 space-y-2">
        <p className="text-xs text-neutral-400 uppercase tracking-wide">No incluye</p>
        {exclusions.map((exclusion) => (
          <div key={exclusion} className="flex items-center gap-2">
            <X className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-sm text-neutral-500">{exclusion}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
