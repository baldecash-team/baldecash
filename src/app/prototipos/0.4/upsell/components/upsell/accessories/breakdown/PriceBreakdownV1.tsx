// PriceBreakdownV1 - Siempre Visible: Desglose en card lateral/inferior
'use client';

import React from 'react';
import { Card, CardBody, Divider } from '@nextui-org/react';
import { Accessory, InsurancePlan } from '../../../../types/upsell';

interface PriceBreakdownProps {
  productPrice: number;
  productQuota: number;
  accessories: Accessory[];
  selectedAccessoryIds: string[];
  insurancePlan: InsurancePlan | null;
  className?: string;
}

export const PriceBreakdownV1: React.FC<PriceBreakdownProps> = ({
  productPrice,
  productQuota,
  accessories,
  selectedAccessoryIds,
  insurancePlan,
  className = '',
}) => {
  const selectedAccessories = accessories.filter((a) =>
    selectedAccessoryIds.includes(a.id)
  );

  const accessoriesTotal = selectedAccessories.reduce((sum, a) => sum + a.price, 0);
  const accessoriesQuota = selectedAccessories.reduce((sum, a) => sum + a.monthlyQuota, 0);
  const insuranceQuota = insurancePlan?.monthlyPrice || 0;

  const totalQuota = productQuota + accessoriesQuota + insuranceQuota;

  return (
    <Card className={`${className}`}>
      <CardBody className="p-4">
        <h3 className="font-semibold text-neutral-900 mb-3">Resumen de tu compra</h3>

        <div className="space-y-2">
          {/* Product */}
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Equipo</span>
            <span className="text-neutral-900">S/{productQuota}/mes</span>
          </div>

          {/* Accessories */}
          {selectedAccessories.map((accessory) => (
            <div key={accessory.id} className="flex justify-between text-sm">
              <span className="text-neutral-600 truncate max-w-[60%]">{accessory.name}</span>
              <span className="text-neutral-900">+S/{accessory.monthlyQuota}/mes</span>
            </div>
          ))}

          {/* Insurance */}
          {insurancePlan && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">{insurancePlan.name}</span>
              <span className="text-neutral-900">+S/{insurancePlan.monthlyPrice}/mes</span>
            </div>
          )}
        </div>

        <Divider className="my-3" />

        {/* Total */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-neutral-500">Cuota mensual</p>
            <p className="text-2xl font-bold text-neutral-900">S/{totalQuota}</p>
          </div>
          <p className="text-xs text-neutral-400">x 24 meses</p>
        </div>
      </CardBody>
    </Card>
  );
};

export default PriceBreakdownV1;
