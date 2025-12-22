// AccessoryCardV4 - Carrusel: Card para scroll horizontal con snap
'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { Check, Plus } from 'lucide-react';
import { Accessory } from '../../../../types/upsell';

interface AccessoryCardProps {
  accessory: Accessory;
  isSelected: boolean;
  onToggle: () => void;
}

export const AccessoryCardV4: React.FC<AccessoryCardProps> = ({
  accessory,
  isSelected,
  onToggle,
}) => {
  return (
    <Card
      isPressable
      onPress={onToggle}
      className={`cursor-pointer transition-all snap-start shrink-0 w-[280px] ${
        isSelected
          ? 'border-2 border-[#4654CD] bg-[#4654CD]/5'
          : 'border border-neutral-200 hover:border-[#4654CD]/50'
      }`}
    >
      <CardBody className="p-0">
        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
          <img
            src={accessory.image}
            alt={accessory.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium text-neutral-900 text-sm line-clamp-1">
              {accessory.name}
            </h3>
            <div
              className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-[#4654CD] text-white'
                  : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            </div>
          </div>
          <p className="text-xs text-neutral-500 mb-3 line-clamp-2">
            {accessory.description}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-neutral-900">
              S/{accessory.price}
            </span>
            <span className="text-xs text-[#4654CD] font-medium">
              +S/{accessory.monthlyQuota}/mes
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
