// RecommendedBadgeV1 - Badge Sobre Card: "Recomendado" badge estándar
'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface RecommendedBadgeProps {
  isRecommended: boolean;
  className?: string;
}

export const RecommendedBadgeV1: React.FC<RecommendedBadgeProps> = ({
  isRecommended,
  className = '',
}) => {
  if (!isRecommended) return null;

  return (
    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 z-10 ${className}`}>
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#03DBD0] text-white text-sm font-medium rounded-full shadow-lg">
        <Star className="w-4 h-4" />
        Recomendado
      </span>
    </div>
  );
};
