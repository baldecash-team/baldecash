// RecommendedBadgeV2 - Card Grande: Card más grande con borde
'use client';

import React from 'react';

interface RecommendedBadgeProps {
  isRecommended: boolean;
  children: React.ReactNode;
  className?: string;
}

export const RecommendedBadgeV2: React.FC<RecommendedBadgeProps> = ({
  isRecommended,
  children,
  className = '',
}) => {
  if (!isRecommended) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative scale-105 ${className}`}>
      <div className="absolute inset-0 bg-[#4654CD]/10 rounded-2xl -m-1" />
      <div className="relative border-2 border-[#4654CD] rounded-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 bg-[#4654CD] text-white text-center text-sm py-1">
          Más popular
        </div>
        <div className="pt-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default RecommendedBadgeV2;
