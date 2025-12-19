'use client';

/**
 * AccessoryCardV2 - Cards con imagen grande y tamano variable
 *
 * D.3 V2: Tamano segun precio/relevancia
 * D.5 V2: Badge "Agregado" sobre la card
 * D.6 V2: Toggle on/off
 */

import React from 'react';
import { Card, CardBody, Switch, Chip } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessory } from '../../../types/upsell';

interface AccessoryCardV2Props {
  accessory: Accessory;
  isSelected: boolean;
  onToggle: () => void;
  showLimit?: boolean;
  limitReached?: boolean;
}

const getSizeClass = (price: number, isRecommended: boolean): string => {
  if (isRecommended || price >= 150) return 'md:col-span-2';
  return 'col-span-1';
};

export const AccessoryCardV2: React.FC<AccessoryCardV2Props> = ({
  accessory,
  isSelected,
  onToggle,
  showLimit = false,
  limitReached = false,
}) => {
  const canToggle = !limitReached || isSelected;
  const sizeClass = getSizeClass(accessory.price, accessory.isRecommended);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={sizeClass}
    >
      <Card
        className={`relative transition-all duration-200 h-full overflow-hidden ${
          isSelected
            ? 'border-2 border-[#4654CD] shadow-lg shadow-[#4654CD]/10'
            : 'border border-neutral-200 hover:border-neutral-300'
        }`}
      >
        {/* "Agregado" Badge */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-0 left-0 right-0 bg-[#4654CD] text-white text-xs font-medium py-1 text-center z-10"
            >
              Agregado a tu pedido
            </motion.div>
          )}
        </AnimatePresence>

        <CardBody className={`p-0 ${isSelected ? 'pt-7' : ''}`}>
          {/* Large Image */}
          <div className="relative w-full h-32 bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
            <img
              src={accessory.image}
              alt={accessory.name}
              className="w-24 h-24 object-contain"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/products/placeholder.png';
              }}
            />
            {accessory.isRecommended && (
              <Chip
                size="sm"
                className="absolute top-2 right-2 bg-amber-100 text-amber-700"
                classNames={{
                  content: 'text-[10px] font-semibold',
                }}
              >
                Recomendado
              </Chip>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-neutral-800">
                  {accessory.name}
                </h4>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                  {accessory.description}
                </p>
              </div>

              {/* Toggle Switch */}
              <Switch
                isSelected={isSelected}
                onValueChange={canToggle ? onToggle : undefined}
                isDisabled={!canToggle}
                size="sm"
                classNames={{
                  wrapper: isSelected ? 'bg-[#4654CD]' : 'bg-neutral-300',
                  thumb: 'bg-white shadow-md',
                }}
              />
            </div>

            {/* Price */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
              <div>
                <span className="text-lg font-bold text-[#4654CD] font-['Baloo_2']">
                  +S/{accessory.monthlyQuota}
                </span>
                <span className="text-xs text-neutral-500">/mes</span>
              </div>
              <span className="text-xs text-neutral-400">
                S/{accessory.price} total
              </span>
            </div>

            {/* Limit warning */}
            {showLimit && limitReached && !isSelected && (
              <p className="text-xs text-amber-600 mt-2 text-center">
                Maximo 3 accesorios alcanzado
              </p>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default AccessoryCardV2;
