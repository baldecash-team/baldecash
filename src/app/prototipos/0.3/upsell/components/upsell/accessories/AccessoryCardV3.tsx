'use client';

/**
 * AccessoryCardV3 - Lista compacta (Carrusel horizontal)
 *
 * D.3 V3: Carrusel horizontal
 * D.5 V3: Cambio de boton "Agregar" -> "Quitar"
 * D.6 V3: Click para deseleccionar
 */

import React from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Accessory } from '../../../types/upsell';

interface AccessoryCardV3Props {
  accessory: Accessory;
  isSelected: boolean;
  onToggle: () => void;
  showLimit?: boolean;
  limitReached?: boolean;
}

export const AccessoryCardV3: React.FC<AccessoryCardV3Props> = ({
  accessory,
  isSelected,
  onToggle,
  showLimit = false,
  limitReached = false,
}) => {
  const canAdd = !limitReached || isSelected;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-shrink-0 w-[280px] snap-start"
    >
      <Card
        isPressable={canAdd}
        onPress={canAdd ? onToggle : undefined}
        className={`h-full transition-all duration-200 cursor-pointer ${
          isSelected
            ? 'border-2 border-[#22c55e] bg-[#22c55e]/5'
            : canAdd
              ? 'border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-md'
              : 'border border-neutral-200 opacity-50'
        }`}
      >
        <CardBody className="p-3">
          <div className="flex items-center gap-3">
            {/* Compact Image */}
            <div className="w-16 h-16 flex-shrink-0 bg-neutral-50 rounded-lg p-1.5 flex items-center justify-center">
              <img
                src={accessory.image}
                alt={accessory.name}
                className="w-full h-full object-contain"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/products/placeholder.png';
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-1">
                <h4 className="font-medium text-sm text-neutral-800 line-clamp-1 flex-1">
                  {accessory.name}
                </h4>
                {accessory.isRecommended && (
                  <Chip
                    size="sm"
                    variant="dot"
                    color="success"
                    classNames={{
                      base: 'h-4 px-1 border-none',
                      content: 'text-[9px]',
                      dot: 'w-1.5 h-1.5',
                    }}
                  >
                    Top
                  </Chip>
                )}
              </div>
              <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                {accessory.description}
              </p>

              {/* Price and Action */}
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-[#4654CD] font-['Baloo_2']">
                  +S/{accessory.monthlyQuota}/mes
                </span>

                <Button
                  size="sm"
                  isIconOnly
                  className={`min-w-8 w-8 h-8 cursor-pointer ${
                    isSelected
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : canAdd
                        ? 'bg-[#4654CD] text-white hover:bg-[#3a47b8]'
                        : 'bg-neutral-100 text-neutral-400'
                  }`}
                  onPress={() => {
                    if (canAdd) onToggle();
                  }}
                  disabled={!canAdd}
                >
                  {isSelected ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Limit warning */}
          {showLimit && limitReached && !isSelected && (
            <p className="text-[10px] text-amber-600 mt-1.5 text-center">
              Limite alcanzado
            </p>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default AccessoryCardV3;
