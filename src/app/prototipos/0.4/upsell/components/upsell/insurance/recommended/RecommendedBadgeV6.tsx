// RecommendedBadgeV6 - Hero Card: Plan recomendado como hero central
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star } from 'lucide-react';

interface RecommendedBadgeProps {
  isRecommended: boolean;
  className?: string;
}

export const RecommendedBadgeV6: React.FC<RecommendedBadgeProps> = ({
  isRecommended,
  className = '',
}) => {
  if (!isRecommended) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`absolute -top-6 left-0 right-0 flex justify-center z-10 ${className}`}
    >
      <div className="flex items-center gap-2 px-6 py-2 bg-[#4654CD] text-white rounded-t-xl shadow-lg">
        <Crown className="w-5 h-5" />
        <span className="font-bold">MEJOR OPCIÓN</span>
        <div className="flex gap-0.5">
          {[1, 2, 3].map((i) => (
            <Star key={i} className="w-3 h-3 fill-[#03DBD0] text-[#03DBD0]" />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
