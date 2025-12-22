// PriceBreakdownV2 - Tooltip: Desglose en hover sobre total
'use client';

import React from 'react';
import { Tooltip } from '@nextui-org/react';
import { Info } from 'lucide-react';
import { Accessory, InsurancePlan } from '../../../../types/upsell';

interface PriceBreakdownProps {
  productPrice: number;
  productQuota: number;
  accessories: Accessory[];
  selectedAccessoryIds: string[];
  insurancePlan: InsurancePlan | null;
  className?: string;
}

export const PriceBreakdownV2: React.FC<PriceBreakdownProps> = ({
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

  const tooltipContent = (
    <div className="p-2 space-y-1">
      <div className="flex justify-between gap-4 text-sm">
        <span>Equipo</span>
        <span>S/{productQuota}</span>
      </div>
      {selectedAccessories.map((a) => (
        <div key={a.id} className="flex justify-between gap-4 text-sm">
          <span className="truncate max-w-[120px]">{a.name}</span>
          <span>+S/{a.monthlyQuota}</span>
        </div>
      ))}
      {insurancePlan && (
        <div className="flex justify-between gap-4 text-sm">
          <span>{insurancePlan.name}</span>
          <span>+S/{insurancePlan.monthlyPrice}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div>
        <p className="text-xs text-neutral-500">Cuota mensual</p>
        <p className="text-2xl font-bold text-neutral-900">S/{totalQuota}</p>
      </div>
      <Tooltip content={tooltipContent} placement="top">
        <button className="cursor-pointer">
          <Info className="w-5 h-5 text-neutral-400 hover:text-[#4654CD] transition-colors" />
        </button>
      </Tooltip>
    </div>
  );
};
