// RecommendedBadgeV4 - Pulso: Animación de pulso sutil
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface RecommendedBadgeProps {
  isRecommended: boolean;
  className?: string;
}

export const RecommendedBadgeV4: React.FC<RecommendedBadgeProps> = ({
  isRecommended,
  className = '',
}) => {
  if (!isRecommended) return null;

  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{ duration: 2, repeat: Infinity }}
      className={`absolute -top-3 left-1/2 -translate-x-1/2 z-10 ${className}`}
    >
      <motion.span
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(3, 219, 208, 0.4)',
            '0 0 0 10px rgba(3, 219, 208, 0)',
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="inline-flex items-center gap-1 px-4 py-1.5 bg-[#03DBD0] text-white text-sm font-medium rounded-full"
      >
        <Sparkles className="w-4 h-4" />
        Recomendado
      </motion.span>
    </motion.div>
  );
};
