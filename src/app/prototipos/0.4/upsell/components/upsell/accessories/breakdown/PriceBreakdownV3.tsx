// PriceBreakdownV3 - Ver Desglose: Solo total + botón expandir
'use client';

import React, { useState } from 'react';
import { Button, Divider } from '@nextui-org/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessory, InsurancePlan } from '../../../../types/upsell';

interface PriceBreakdownProps {
  productPrice: number;
  productQuota: number;
  accessories: Accessory[];
  selectedAccessoryIds: string[];
  insurancePlan: InsurancePlan | null;
  className?: string;
}

export const PriceBreakdownV3: React.FC<PriceBreakdownProps> = ({
  productQuota,
  accessories,
  selectedAccessoryIds,
  insurancePlan,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedAccessories = accessories.filter((a) =>
    selectedAccessoryIds.includes(a.id)
  );

  const accessoriesQuota = selectedAccessories.reduce((sum, a) => sum + a.monthlyQuota, 0);
  const insuranceQuota = insurancePlan?.monthlyPrice || 0;
  const totalQuota = productQuota + accessoriesQuota + insuranceQuota;

  return (
    <div className={`bg-white rounded-xl border border-neutral-200 overflow-hidden ${className}`}>
      {/* Header - Always visible */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-500">Cuota mensual</p>
          <p className="text-2xl font-bold text-neutral-900">S/{totalQuota}</p>
        </div>
        <Button
          variant="light"
          size="sm"
          onPress={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer text-[#4654CD]"
          endContent={isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        >
          {isExpanded ? 'Ocultar' : 'Ver desglose'}
        </Button>
      </div>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Divider />
            <div className="p-4 space-y-2 bg-neutral-50">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Equipo</span>
                <span className="text-neutral-900">S/{productQuota}/mes</span>
              </div>
              {selectedAccessories.map((accessory) => (
                <div key={accessory.id} className="flex justify-between text-sm">
                  <span className="text-neutral-600 truncate max-w-[60%]">{accessory.name}</span>
                  <span className="text-neutral-900">+S/{accessory.monthlyQuota}/mes</span>
                </div>
              ))}
              {insurancePlan && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">{insurancePlan.name}</span>
                  <span className="text-neutral-900">+S/{insurancePlan.monthlyPrice}/mes</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PriceBreakdownV3;
