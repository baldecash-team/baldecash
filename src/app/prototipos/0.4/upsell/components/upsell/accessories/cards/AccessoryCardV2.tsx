// AccessoryCardV2 - Variable: Tamaño variable según precio
'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { Check, Plus, Star } from 'lucide-react';
import { Accessory } from '../../../../types/upsell';

interface AccessoryCardProps {
  accessory: Accessory;
  isSelected: boolean;
  onToggle: () => void;
}

export const AccessoryCardV2: React.FC<AccessoryCardProps> = ({
  accessory,
  isSelected,
  onToggle,
}) => {
  // Determinar tamaño basado en precio
  const isLarge = accessory.price > 100;

  return (
    <Card
      isPressable
      onPress={onToggle}
      className={`cursor-pointer transition-all ${
        isLarge ? 'col-span-2 row-span-2' : ''
      } ${
        isSelected
          ? 'border-2 border-[#4654CD] bg-[#4654CD]/5'
          : 'border border-neutral-200 hover:border-[#4654CD]/50'
      }`}
    >
      <CardBody className={`p-4 ${isLarge ? 'p-6' : ''}`}>
        {/* Recommended badge */}
        {accessory.isRecommended && (
          <div className="absolute top-2 right-2 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#03DBD0] text-white text-xs rounded-full">
              <Star className="w-3 h-3" />
              Popular
            </span>
          </div>
        )}

        {/* Image */}
        <div className={`rounded-lg overflow-hidden mb-3 bg-neutral-100 ${
          isLarge ? 'aspect-video' : 'aspect-square'
        }`}>
          <img
            src={accessory.image}
            alt={accessory.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <h3 className={`font-medium text-neutral-900 mb-1 ${
          isLarge ? 'text-lg' : 'text-sm'
        }`}>
          {accessory.name}
        </h3>
        <p className={`text-neutral-500 mb-3 ${isLarge ? 'text-sm' : 'text-xs line-clamp-2'}`}>
          {accessory.description}
        </p>

        {/* Price & Action */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className={`font-bold text-neutral-900 ${isLarge ? 'text-2xl' : 'text-lg'}`}>
              S/{accessory.price}
            </p>
            <p className="text-xs text-neutral-500">
              +S/{accessory.monthlyQuota}/mes
            </p>
          </div>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-[#4654CD] text-white'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default AccessoryCardV2;
