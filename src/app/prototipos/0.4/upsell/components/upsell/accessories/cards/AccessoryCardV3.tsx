// AccessoryCardV3 - Flat Uniforme: Cards con ilustraciones flat
'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { Check, Plus, Mouse, Briefcase, Headphones, Usb, Fan, HardDrive } from 'lucide-react';
import { Accessory } from '../../../../types/upsell';

interface AccessoryCardProps {
  accessory: Accessory;
  isSelected: boolean;
  onToggle: () => void;
}

// Mapeo de categorías a iconos
const categoryIcons: Record<string, React.ElementType> = {
  conectividad: Mouse,
  proteccion: Briefcase,
  audio: Headphones,
  almacenamiento: HardDrive,
};

export const AccessoryCardV3: React.FC<AccessoryCardProps> = ({
  accessory,
  isSelected,
  onToggle,
}) => {
  const IconComponent = categoryIcons[accessory.category] || Usb;

  return (
    <Card
      isPressable
      onPress={onToggle}
      className={`cursor-pointer transition-all ${
        isSelected
          ? 'border-2 border-[#4654CD] bg-[#4654CD]/5'
          : 'border border-neutral-200 hover:border-[#4654CD]/50'
      }`}
    >
      <CardBody className="p-5">
        {/* Flat illustration */}
        <div className="flex items-center justify-center mb-4">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
            isSelected ? 'bg-[#4654CD]/10' : 'bg-neutral-100'
          }`}>
            <IconComponent className={`w-10 h-10 ${
              isSelected ? 'text-[#4654CD]' : 'text-neutral-400'
            }`} />
          </div>
        </div>

        {/* Content */}
        <h3 className="font-medium text-neutral-900 text-sm text-center mb-1">
          {accessory.name}
        </h3>
        <p className="text-xs text-neutral-500 text-center mb-4 line-clamp-2">
          {accessory.description}
        </p>

        {/* Price & Selection */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-neutral-900">
              S/{accessory.price}
            </p>
            <p className="text-xs text-neutral-500">
              +S/{accessory.monthlyQuota}/mes
            </p>
          </div>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-[#4654CD] text-white'
                : 'border border-neutral-300 text-neutral-400'
            }`}
          >
            {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default AccessoryCardV3;
