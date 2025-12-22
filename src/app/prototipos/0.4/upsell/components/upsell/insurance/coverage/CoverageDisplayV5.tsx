// CoverageDisplayV5 - Split: Coberturas izq + exclusiones der
'use client';

import React from 'react';
import { Check, X, ShieldCheck, ShieldOff } from 'lucide-react';
import { CoverageItem } from '../../../../types/upsell';

interface CoverageDisplayProps {
  coverage: CoverageItem[];
  exclusions: string[];
  className?: string;
}

export const CoverageDisplayV5: React.FC<CoverageDisplayProps> = ({
  coverage,
  exclusions,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Coverage column */}
      <div className="bg-[#03DBD0]/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-[#03DBD0]" />
          <h4 className="font-semibold text-neutral-900">Incluye</h4>
        </div>
        <div className="space-y-2">
          {coverage.map((item) => (
            <div key={item.name} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-[#03DBD0] shrink-0 mt-0.5" />
              <span className="text-sm text-neutral-700">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Exclusions column */}
      <div className="bg-neutral-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShieldOff className="w-5 h-5 text-neutral-400" />
          <h4 className="font-semibold text-neutral-600">No incluye</h4>
        </div>
        <div className="space-y-2">
          {exclusions.map((exclusion) => (
            <div key={exclusion} className="flex items-start gap-2">
              <X className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <span className="text-sm text-neutral-500">{exclusion}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
