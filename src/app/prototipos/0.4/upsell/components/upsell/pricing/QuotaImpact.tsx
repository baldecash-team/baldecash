'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Minus } from 'lucide-react';

interface QuotaImpactProps {
  baseQuota: number;
  additionalQuota: number;
  type: 'accessory' | 'insurance';
}

/**
 * QuotaImpact - Muestra el impacto en la cuota de forma prominente
 * Destaca el total mensual con gradiente y sombra
 */
export const QuotaImpact: React.FC<QuotaImpactProps> = ({
  baseQuota,
  additionalQuota,
  type,
}) => {
  const totalQuota = baseQuota + additionalQuota;
  const hasImpact = additionalQuota > 0;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-neutral-500" />
        <span className="text-sm text-neutral-600">Impacto en tu cuota</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Base quota */}
        <div className="text-center">
          <p className="text-xs text-neutral-500 mb-1">Base</p>
          <p className="text-lg font-semibold text-neutral-700">S/{baseQuota}</p>
        </div>

        {hasImpact && (
          <>
            {/* Plus sign */}
            <div className="text-neutral-400">+</div>

            {/* Additional quota */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <p className="text-xs text-neutral-500 mb-1">
                {type === 'accessory' ? 'Accesorios' : 'Seguro'}
              </p>
              <p className="text-lg font-semibold text-[#4654CD]">S/{additionalQuota}</p>
            </motion.div>

            {/* Equals sign */}
            <div className="text-neutral-400">=</div>
          </>
        )}

        {/* Total - prominent display */}
        <motion.div
          layout
          className="px-5 py-3 bg-gradient-to-r from-[#4654CD] to-[#5B68D8] rounded-xl shadow-lg shadow-[#4654CD]/30 border-2 border-white/20"
        >
          <p className="text-[10px] text-white/90 uppercase tracking-wider font-medium">Total mensual</p>
          <p className="font-bold text-2xl text-white font-['Baloo_2'] leading-tight">
            S/{totalQuota}<span className="text-sm font-normal opacity-80">/mes</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default QuotaImpact;
