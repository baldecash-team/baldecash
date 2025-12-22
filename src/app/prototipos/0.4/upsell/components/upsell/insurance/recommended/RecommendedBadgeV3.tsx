// RecommendedBadgeV3 - Estrella Flat: Ilustración de estrella/medalla
'use client';

import React from 'react';
import { Award } from 'lucide-react';

interface RecommendedBadgeProps {
  isRecommended: boolean;
  className?: string;
}

export const RecommendedBadgeV3: React.FC<RecommendedBadgeProps> = ({
  isRecommended,
  className = '',
}) => {
  if (!isRecommended) return null;

  return (
    <div className={`absolute -top-4 -right-4 z-10 ${className}`}>
      <div className="w-12 h-12 bg-[#03DBD0] rounded-full flex items-center justify-center shadow-lg">
        <Award className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};

export default RecommendedBadgeV3;
