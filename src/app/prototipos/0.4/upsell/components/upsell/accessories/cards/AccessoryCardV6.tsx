// AccessoryCardV6 - Full Width: Cards gigantes una por fila
'use client';

import React from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { Check, Plus, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Accessory } from '../../../../types/upsell';

interface AccessoryCardProps {
  accessory: Accessory;
  isSelected: boolean;
  onToggle: () => void;
}

export const AccessoryCardV6: React.FC<AccessoryCardProps> = ({
  accessory,
  isSelected,
  onToggle,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        isPressable
        onPress={onToggle}
        className={`cursor-pointer transition-all w-full ${
          isSelected
            ? 'border-2 border-[#4654CD] bg-[#4654CD]/5'
            : 'border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-lg'
        }`}
      >
        <CardBody className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="w-full sm:w-48 h-48 sm:h-auto overflow-hidden bg-neutral-100 shrink-0">
              <img
                src={accessory.image}
                alt={accessory.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-neutral-900">
                    {accessory.name}
                  </h3>
                  {accessory.isRecommended && (
                    <span className="px-2 py-1 bg-[#03DBD0]/10 text-[#03DBD0] text-xs font-medium rounded">
                      Recomendado
                    </span>
                  )}
                </div>
                <p className="text-neutral-500 mb-4">
                  {accessory.description}
                </p>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-neutral-900">
                    S/{accessory.price}
                  </span>
                  <span className="text-sm text-neutral-500">
                    +S/{accessory.monthlyQuota}/mes
                  </span>
                </div>
                <Button
                  size="lg"
                  className={`cursor-pointer font-medium ${
                    isSelected
                      ? 'bg-[#4654CD] text-white'
                      : 'bg-neutral-900 text-white'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Agregado
                    </>
                  ) : (
                    <>
                      Agregar
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default AccessoryCardV6;
