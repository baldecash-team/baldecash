// PriceBreakdownV4 - Animado: Desglose que expande/colapsa con animaciones
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { Accessory, InsurancePlan } from '../../../../types/upsell';

interface PriceBreakdownProps {
  productPrice: number;
  productQuota: number;
  accessories: Accessory[];
  selectedAccessoryIds: string[];
  insurancePlan: InsurancePlan | null;
  className?: string;
}

export const PriceBreakdownV4: React.FC<PriceBreakdownProps> = ({
  productQuota,
  accessories,
  selectedAccessoryIds,
  insurancePlan,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const selectedAccessories = accessories.filter((a) =>
    selectedAccessoryIds.includes(a.id)
  );

  const accessoriesQuota = selectedAccessories.reduce((sum, a) => sum + a.monthlyQuota, 0);
  const insuranceQuota = insurancePlan?.monthlyPrice || 0;
  const totalQuota = productQuota + accessoriesQuota + insuranceQuota;

  const items = [
    { label: 'Equipo', value: productQuota, isBase: true },
    ...selectedAccessories.map((a) => ({
      label: a.name,
      value: a.monthlyQuota,
      isBase: false,
    })),
    ...(insurancePlan
      ? [{ label: insurancePlan.name, value: insurancePlan.monthlyPrice, isBase: false }]
      : []),
  ];

  return (
    <div className={`bg-white rounded-2xl border border-neutral-200 overflow-hidden ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 transition-colors"
      >
        <div className="text-left">
          <p className="text-xs text-neutral-500">Tu cuota mensual</p>
          <motion.p
            key={totalQuota}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-neutral-900"
          >
            S/{totalQuota}
          </motion.p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center"
        >
          {isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-1">
              {items.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex justify-between items-center py-2 border-t border-neutral-100"
                >
                  <span className="text-sm text-neutral-600 truncate max-w-[60%]">
                    {item.label}
                  </span>
                  <span className={`text-sm font-medium ${item.isBase ? 'text-neutral-900' : 'text-[#4654CD]'}`}>
                    {item.isBase ? '' : '+'}S/{item.value}/mes
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
