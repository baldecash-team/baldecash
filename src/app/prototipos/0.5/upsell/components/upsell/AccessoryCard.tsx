'use client';

import React from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { Check, Plus, Info } from 'lucide-react';
import type { Accessory } from '../../types/upsell';
import { formatMoney } from '../../../utils/formatMoney';

interface AccessoryCardProps {
  accessory: Accessory;
  isSelected: boolean;
  onToggle: () => void;
  onViewDetails?: () => void;
}

/**
 * AccessoryCard - Grid uniforme e-commerce (basado en V1 de 0.4)
 * Cards del mismo tamaño en grid 3 columnas
 */
export const AccessoryCard: React.FC<AccessoryCardProps> = ({
  accessory,
  isSelected,
  onToggle,
  onViewDetails,
}) => {
  const hasSpecs = accessory.specs && accessory.specs.length > 0;

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
        <p className="text-xs text-neutral-500 mb-2 line-clamp-2">
          {accessory.description}
        </p>

        {/* Ver características button */}
        {onViewDetails && hasSpecs && (
          <div
            role="button"
            tabIndex={0}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                onViewDetails();
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-[#4654CD] bg-[#4654CD]/10 hover:bg-[#4654CD]/20 font-medium py-2 px-3 rounded-lg mb-3 cursor-pointer transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            Ver características
          </div>
        )}

        {/* Price */}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-[#4654CD] font-bold">
            +S/{formatMoney(accessory.monthlyQuota)}/mes
          </span>
          {!isSelected && (
            <Plus className="w-5 h-5 text-neutral-400" />
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default AccessoryCard;
