'use client';

/**
 * QuotaImpact - Impacto en cuota mensual
 *
 * Muestra claramente cuanto sube la cuota con cada item
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface QuotaImpactProps {
  baseQuota: number;
  accessoriesQuota: number;
  insuranceQuota: number;
  totalQuota: number;
}

export const QuotaImpact: React.FC<QuotaImpactProps> = ({
  baseQuota,
  accessoriesQuota,
  insuranceQuota,
  totalQuota,
}) => {
  const hasAdditions = accessoriesQuota > 0 || insuranceQuota > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gradient-to-r from-[#4654CD]/5 to-[#4654CD]/10 rounded-xl"
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-[#4654CD]" />
        <h4 className="text-sm font-semibold text-neutral-800">
          Impacto en tu cuota
        </h4>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Base quota */}
        <div className="px-3 py-1.5 bg-white rounded-lg">
          <p className="text-[10px] text-neutral-400 uppercase">Laptop</p>
          <p className="font-semibold text-neutral-700 font-['Baloo_2']">
            S/{baseQuota}
          </p>
        </div>

        {accessoriesQuota > 0 && (
          <>
            <ArrowRight className="w-4 h-4 text-neutral-300" />
            <div className="px-3 py-1.5 bg-white rounded-lg">
              <p className="text-[10px] text-neutral-400 uppercase">
                + Accesorios
              </p>
              <p className="font-semibold text-amber-600 font-['Baloo_2']">
                +S/{accessoriesQuota}
              </p>
            </div>
          </>
        )}

        {insuranceQuota > 0 && (
          <>
            <ArrowRight className="w-4 h-4 text-neutral-300" />
            <div className="px-3 py-1.5 bg-white rounded-lg">
              <p className="text-[10px] text-neutral-400 uppercase">+ Seguro</p>
              <p className="font-semibold text-blue-600 font-['Baloo_2']">
                +S/{insuranceQuota}
              </p>
            </div>
          </>
        )}

        {hasAdditions && (
          <>
            <ArrowRight className="w-4 h-4 text-neutral-300" />
            <div className="px-3 py-1.5 bg-[#4654CD] rounded-lg">
              <p className="text-[10px] text-white/70 uppercase">Total</p>
              <p className="font-bold text-white font-['Baloo_2']">
                S/{totalQuota}
              </p>
            </div>
          </>
        )}
      </div>

      {hasAdditions && (
        <p className="text-xs text-neutral-500 mt-3">
          Tu cuota aumenta{' '}
          <span className="font-semibold text-neutral-700">
            S/{accessoriesQuota + insuranceQuota}
          </span>{' '}
          respecto a solo la laptop
        </p>
      )}
    </motion.div>
  );
};

export default QuotaImpact;
