// PriceBreakdownV5 - Columna Fija: Desglose en columna lateral (sticky)
'use client';

import React from 'react';
import { Card, CardBody, Divider, Button } from '@nextui-org/react';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { Accessory, InsurancePlan } from '../../../../types/upsell';

interface PriceBreakdownProps {
  productPrice: number;
  productQuota: number;
  accessories: Accessory[];
  selectedAccessoryIds: string[];
  insurancePlan: InsurancePlan | null;
  onContinue?: () => void;
  className?: string;
}

export const PriceBreakdownV5: React.FC<PriceBreakdownProps> = ({
  productQuota,
  accessories,
  selectedAccessoryIds,
  insurancePlan,
  onContinue,
  className = '',
}) => {
  const selectedAccessories = accessories.filter((a) =>
    selectedAccessoryIds.includes(a.id)
  );

  const accessoriesQuota = selectedAccessories.reduce((sum, a) => sum + a.monthlyQuota, 0);
  const insuranceQuota = insurancePlan?.monthlyPrice || 0;
  const totalQuota = productQuota + accessoriesQuota + insuranceQuota;
  const itemCount = 1 + selectedAccessories.length + (insurancePlan ? 1 : 0);

  return (
    <Card className={`sticky top-4 ${className}`}>
      <CardBody className="p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5 text-[#4654CD]" />
          <h3 className="font-semibold text-neutral-900">
            Tu compra ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h3>
        </div>

        {/* Items */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-900">Equipo</p>
              <p className="text-xs text-neutral-500">Laptop</p>
            </div>
            <p className="text-sm text-neutral-900">S/{productQuota}/mes</p>
          </div>

          {selectedAccessories.map((accessory) => (
            <div key={accessory.id} className="flex justify-between">
              <p className="text-sm text-neutral-600 truncate max-w-[60%]">
                {accessory.name}
              </p>
              <p className="text-sm text-[#4654CD]">+S/{accessory.monthlyQuota}</p>
            </div>
          ))}

          {insurancePlan && (
            <div className="flex justify-between">
              <p className="text-sm text-neutral-600">{insurancePlan.name}</p>
              <p className="text-sm text-[#4654CD]">+S/{insurancePlan.monthlyPrice}</p>
            </div>
          )}
        </div>

        <Divider />

        {/* Total */}
        <div className="py-4">
          <div className="flex justify-between items-end mb-1">
            <span className="text-sm text-neutral-500">Cuota mensual</span>
            <span className="text-3xl font-bold text-neutral-900">S/{totalQuota}</span>
          </div>
          <p className="text-xs text-neutral-400 text-right">x 24 meses sin intereses</p>
        </div>

        {/* CTA */}
        {onContinue && (
          <Button
            color="primary"
            size="lg"
            className="w-full bg-[#4654CD] cursor-pointer"
            onPress={onContinue}
            endContent={<ChevronRight className="w-5 h-5" />}
          >
            Continuar
          </Button>
        )}
      </CardBody>
    </Card>
  );
};
