'use client';

import React from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
import { Check, Plus, Info } from 'lucide-react';
import type { Accessory } from '../../types/upsell';
import { formatMoneyNoDecimals } from '../../utils/formatMoney';

interface AccessoryCardProps {
  accessory: Accessory;
  isSelected: boolean;
  onToggle: () => void;
  onViewDetails?: () => void;
  /** Frecuencia de pago del producto principal (para sufijo de cuota) */
  paymentFrequency?: string;
  /** Primer accesorio recomendado por Molti — muestra ribbon diagonal */
  isMoltiTop?: boolean;
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
  paymentFrequency,
  isMoltiTop = false,
}) => {
  const freqSuffix =
    paymentFrequency === 'semanal' ? '/sem'
    : paymentFrequency === 'quincenal' ? '/qcn'
    : '/mes';

  return (
    <div className="relative h-full">
      {/* Ribbon diagonal esquina superior izquierda */}
      {isMoltiTop && (
        <div className="absolute top-0 left-0 z-10 overflow-hidden w-24 h-24 rounded-tl-xl pointer-events-none">
          <div
            className="absolute -left-6 top-4 w-28 text-center text-[10px] font-bold text-white py-1 rotate-[-45deg]"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Para ti
          </div>
        </div>
      )}

      <Card
        isPressable
        onPress={onToggle}
        className={`transition-all !cursor-pointer h-full border-2 ${
          isSelected
            ? 'border-[#22c55e] bg-[#22c55e]/5'
            : isMoltiTop
            ? 'border-[rgba(var(--color-primary-rgb),0.5)]'
            : 'border-transparent hover:border-[rgba(var(--color-primary-rgb),0.3)]'
        }`}
      >
        <CardBody className="p-4">
          {/* Header with badge */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex gap-1.5 flex-wrap">
              {!isMoltiTop && accessory.isRecommended && (
                <Chip
                  size="sm"
                  radius="sm"
                  classNames={{
                    base: 'bg-[var(--color-primary)] px-2 py-0.5 h-auto',
                    content: 'text-white text-xs font-medium',
                  }}
                >
                  Popular
                </Chip>
              )}
            </div>
            <div
              className={`w-6 h-6 bg-[#22c55e] rounded-full flex items-center justify-center ml-auto transition-all duration-200 ${
                isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}
            >
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Image */}
          <div className="w-full h-24 mb-3 flex items-center justify-center rounded-lg">
            <img
              src={accessory.thumbnailUrl || accessory.image}
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
          <h4 className="font-semibold text-sm text-neutral-800 mb-1 line-clamp-2 min-h-[2.5rem]">
            {accessory.name}
          </h4>
          <p className="text-xs text-neutral-500 mb-2 line-clamp-2 min-h-[2rem]">
            {accessory.description}
          </p>

          {/* Ver detalles button */}
          {onViewDetails && (
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
              className="w-full flex items-center justify-center gap-1.5 text-xs text-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.1)] hover:bg-[rgba(var(--color-primary-rgb),0.2)] font-medium py-2.5 sm:py-2 px-3 min-h-[36px] sm:min-h-0 rounded-lg mb-3 cursor-pointer transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              Ver detalles
            </div>
          )}

          {/* Price */}
          <div className="mt-auto flex items-center justify-between">
            <div>
              <span className="text-[var(--color-primary)] font-bold">
                +S/{formatMoneyNoDecimals(Math.floor(accessory.monthlyQuota))}{freqSuffix}
              </span>
              {accessory.term && (
                <p className="text-[10px] text-neutral-400">en {accessory.term} meses</p>
              )}
            </div>
            <Plus
              className={`w-5 h-5 text-neutral-400 transition-all duration-200 ${
                isSelected ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AccessoryCard;
