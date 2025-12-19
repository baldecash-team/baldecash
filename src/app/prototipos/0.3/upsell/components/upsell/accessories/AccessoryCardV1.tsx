'use client';

/**
 * AccessoryCardV1 - Cards Uniformes
 *
 * Grid limpio con cards de tamano uniforme
 * D.3: Tamano uniforme (grid limpio)
 * D.5 V1: Checkmark verde + borde color
 * D.6 V1: Boton X en la card
 */

import React from 'react';
import { Card, CardBody, Button, Chip } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, X } from 'lucide-react';
import { Accessory } from '../../../types/upsell';

interface AccessoryCardV1Props {
  accessory: Accessory;
  isSelected: boolean;
  onToggle: () => void;
  showLimit?: boolean;
  limitReached?: boolean;
}

export const AccessoryCardV1: React.FC<AccessoryCardV1Props> = ({
  accessory,
  isSelected,
  onToggle,
  showLimit = false,
  limitReached = false,
}) => {
  const canAdd = !limitReached || isSelected;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`relative transition-all duration-200 h-full ${
          isSelected
            ? 'border-2 border-[#22c55e] bg-[#22c55e]/5'
            : 'border border-neutral-200 hover:border-neutral-300'
        }`}
      >
        {/* Remove button (X) when selected */}
        <AnimatePresence>
          {isSelected && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              <X className="w-3.5 h-3.5 text-neutral-600" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Selected checkmark */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-[#22c55e] flex items-center justify-center"
            >
              <Check className="w-3.5 h-3.5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        <CardBody className="p-4">
          <div className="flex gap-4">
            {/* Image */}
            <div className="w-20 h-20 flex-shrink-0 bg-neutral-50 rounded-lg p-2 flex items-center justify-center">
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
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm text-neutral-800 line-clamp-2">
                  {accessory.name}
                </h4>
                {accessory.isRecommended && (
                  <Chip
                    size="sm"
                    color="primary"
                    variant="flat"
                    classNames={{
                      base: 'h-5 px-1.5',
                      content: 'text-[10px] font-medium',
                    }}
                  >
                    Popular
                  </Chip>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                {accessory.description}
              </p>
              <p className="font-bold text-[#4654CD] mt-2 font-['Baloo_2']">
                +S/{accessory.monthlyQuota}/mes
              </p>
            </div>
          </div>

          {/* Add/Remove Button */}
          <Button
            className={`w-full mt-4 cursor-pointer ${
              isSelected
                ? 'bg-[#22c55e] text-white'
                : canAdd
                  ? 'bg-neutral-100 hover:bg-neutral-200'
                  : 'bg-neutral-50 text-neutral-400 cursor-not-allowed'
            }`}
            startContent={
              isSelected ? (
                <Check className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )
            }
            onPress={canAdd ? onToggle : undefined}
            disabled={!canAdd}
          >
            {isSelected ? 'Agregado' : 'Agregar'}
          </Button>

          {/* Limit warning */}
          {showLimit && limitReached && !isSelected && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              Maximo 3 accesorios alcanzado
            </p>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default AccessoryCardV1;
