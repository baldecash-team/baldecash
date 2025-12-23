// PriceBreakdownV6 - Centrado: Desglose prominente centrado
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Accessory, InsurancePlan } from '../../../../types/upsell';

interface PriceBreakdownProps {
  productPrice: number;
  productQuota: number;
  accessories: Accessory[];
  selectedAccessoryIds: string[];
  insurancePlan: InsurancePlan | null;
  className?: string;
}

export const PriceBreakdownV6: React.FC<PriceBreakdownProps> = ({
  productQuota,
  accessories,
  selectedAccessoryIds,
  insurancePlan,
  className = '',
}) => {
  const selectedAccessories = accessories.filter((a) =>
    selectedAccessoryIds.includes(a.id)
  );

  const accessoriesQuota = selectedAccessories.reduce((sum, a) => sum + a.monthlyQuota, 0);
  const insuranceQuota = insurancePlan?.monthlyPrice || 0;
  const totalQuota = productQuota + accessoriesQuota + insuranceQuota;
  const addedQuota = accessoriesQuota + insuranceQuota;

  return (
    <div className={`text-center py-8 ${className}`}>
      {/* Main price */}
      <p className="text-sm text-neutral-500 mb-1">Tu cuota mensual será de</p>
      <motion.div
        key={totalQuota}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-2"
      >
        <span className="text-5xl font-bold text-neutral-900">S/{totalQuota}</span>
        <span className="text-xl text-neutral-400">/mes</span>
      </motion.div>

      {/* Breakdown inline */}
      <div className="inline-flex items-center gap-2 text-sm text-neutral-500">
        <span>S/{productQuota} equipo</span>
        {addedQuota > 0 && (
          <>
            <span className="text-neutral-300">+</span>
            <motion.span
              key={addedQuota}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#4654CD] font-medium"
            >
              S/{addedQuota} adicionales
            </motion.span>
          </>
        )}
      </div>

      {/* Items badges */}
      {(selectedAccessories.length > 0 || insurancePlan) && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {selectedAccessories.map((a) => (
            <span
              key={a.id}
              className="px-3 py-1 bg-[#4654CD]/10 text-[#4654CD] text-xs rounded-full"
            >
              {a.name.split(' ')[0]} +S/{a.monthlyQuota}
            </span>
          ))}
          {insurancePlan && (
            <span className="px-3 py-1 bg-[#03DBD0]/10 text-[#03DBD0] text-xs rounded-full">
              {insurancePlan.name} +S/{insurancePlan.monthlyPrice}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceBreakdownV6;
