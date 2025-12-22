// AccessoryCardV5 - Featured: Accesorio destacado + grid pequeño
'use client';

import React from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { Check, Plus, Star } from 'lucide-react';
import { Accessory } from '../../../../types/upsell';

interface AccessoryCardProps {
  accessory: Accessory;
  isSelected: boolean;
  onToggle: () => void;
  isFeatured?: boolean;
}

export const AccessoryCardV5: React.FC<AccessoryCardProps> = ({
  accessory,
  isSelected,
  onToggle,
  isFeatured = false,
}) => {
  if (isFeatured) {
    return (
      <Card
        isPressable
        onPress={onToggle}
        className={`cursor-pointer transition-all col-span-full ${
          isSelected
            ? 'border-2 border-[#4654CD] bg-[#4654CD]/5'
            : 'border border-neutral-200 hover:border-[#4654CD]/50'
        }`}
      >
        <CardBody className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="w-full md:w-1/2 aspect-video md:aspect-auto overflow-hidden bg-neutral-100">
              <img
                src={accessory.image}
                alt={accessory.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
              <div className="inline-flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 text-[#03DBD0]" />
                <span className="text-sm text-[#03DBD0] font-medium">Más vendido</span>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                {accessory.name}
              </h3>
              <p className="text-neutral-500 mb-4">
                {accessory.description}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-neutral-900">
                    S/{accessory.price}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Solo +S/{accessory.monthlyQuota}/mes a tu cuota
                  </p>
                </div>
                <Button
                  className={`cursor-pointer ${
                    isSelected
                      ? 'bg-[#4654CD] text-white'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Agregado
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Small card for grid
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
      <CardBody className="p-3">
        <div className="flex items-center gap-3">
          {/* Small image */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
            <img
              src={accessory.image}
              alt={accessory.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-neutral-900 text-sm line-clamp-1">
              {accessory.name}
            </h3>
            <p className="text-lg font-bold text-neutral-900">
              S/{accessory.price}
            </p>
            <p className="text-xs text-neutral-500">
              +S/{accessory.monthlyQuota}/mes
            </p>
          </div>

          {/* Selection */}
          <div
            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isSelected
                ? 'bg-[#4654CD] text-white'
                : 'bg-neutral-100 text-neutral-500'
            }`}
          >
            {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default AccessoryCardV5;
