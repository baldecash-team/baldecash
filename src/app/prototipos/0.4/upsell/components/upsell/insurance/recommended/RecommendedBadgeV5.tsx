// RecommendedBadgeV5 - Split Prominente: Recomendado grande + lista
'use client';

import React from 'react';
import { ThumbsUp, Check } from 'lucide-react';

interface RecommendedBadgeProps {
  isRecommended: boolean;
  reasons?: string[];
  className?: string;
}

export const RecommendedBadgeV5: React.FC<RecommendedBadgeProps> = ({
  isRecommended,
  reasons = ['Mejor relación precio-beneficio', 'Más elegido por estudiantes', 'Cobertura completa'],
  className = '',
}) => {
  if (!isRecommended) return null;

  return (
    <div className={`bg-[#4654CD]/5 border border-[#4654CD]/20 rounded-xl p-4 mb-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-[#4654CD] flex items-center justify-center">
          <ThumbsUp className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-[#4654CD]">Nuestro recomendado</span>
      </div>
      <div className="space-y-1">
        {reasons.map((reason) => (
          <div key={reason} className="flex items-center gap-2 text-sm text-neutral-600">
            <Check className="w-4 h-4 text-[#03DBD0]" />
            {reason}
          </div>
        ))}
      </div>
    </div>
  );
};
