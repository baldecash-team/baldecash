'use client';

import React from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { Check, Plus } from 'lucide-react';
import type { Accessory } from '../../../../types/upsell';

interface AccessoryCardV1Props {
  accessory: Accessory;
  isSelected: boolean;
  onToggle: () => void;
}

/**
 * AccessoryCardV1 - Grid uniforme (e-commerce)
 * Cards del mismo tamaño en grid 3 columnas
 */
export const AccessoryCardV1: React.FC<AccessoryCardV1Props> = ({
  accessory,
  isSelected,
  onToggle,
}) => {
  return (
    <Card
      isPressable
      onPress={onToggle}
      className={`transition-all cursor-pointer h-full ${
        isSelected
          ? 'border-2 border-[#22c55e] bg-[#22c55e]/5'
          : 'border border-neutral-200 hover:border-[#4654CD]/50'
      }`}
    >
      <CardBody className="p-4">
        {/* Header with badge */}
        <div className="flex justify-between items-start mb-3">
          {accessory.isRecommended && (
            <Chip
              size="sm"
              radius="sm"
              classNames={{
                base: 'bg-[#4654CD] px-2 py-0.5 h-auto',
                content: 'text-white text-xs font-medium',
              }}
            >
              Popular
            </Chip>
          )}
          {isSelected && (
            <div className="w-6 h-6 bg-[#22c55e] rounded-full flex items-center justify-center ml-auto">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Image */}
        <div className="w-full h-24 mb-3 flex items-center justify-center bg-neutral-50 rounded-lg">
          <img
            src={accessory.image}
            alt={accessory.name}
            className="max-h-20 max-w-full object-contain"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>

        {/* Content */}
        <h4 className="font-semibold text-sm text-neutral-800 mb-1 line-clamp-2">
          {accessory.name}
        </h4>
        <p className="text-xs text-neutral-500 mb-3 line-clamp-2">
          {accessory.description}
        </p>

        {/* Price */}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-[#4654CD] font-bold">
            +S/{accessory.monthlyQuota}/mes
          </span>
          {!isSelected && (
            <Plus className="w-5 h-5 text-neutral-400" />
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default AccessoryCardV1;
