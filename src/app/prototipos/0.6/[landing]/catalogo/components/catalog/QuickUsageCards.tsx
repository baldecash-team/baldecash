'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { UsageType } from '../../types/catalog';
import {
  usageIconMap,
  usageLabels,
  usageDescriptions,
} from './iconRegistry';

interface QuickUsageCardsProps {
  selected: UsageType[];
  onChange: (usage: UsageType[]) => void;
  className?: string;
}

// The 4 main quick usage cards - use centralized registry
const quickUsageCardKeys: UsageType[] = ['estudios', 'diseno', 'oficina', 'gaming'];

/**
 * QuickUsageCards - Selector rápido de uso con cards visuales
 * Permite filtrar rápidamente por tipo de uso sin usar el sidebar
 * Siempre muestra las 4 cards principales: estudiar, crear, trabajar, jugar
 */
export const QuickUsageCards: React.FC<QuickUsageCardsProps> = ({
  selected,
  onChange,
  className = 'mb-8',
}) => {
  const handleCardClick = (value: UsageType) => {
    if (selected.includes(value)) {
      onChange([]);  // Deselect
    } else {
      onChange([value]);  // Single select - replace selection
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickUsageCardKeys.map((usageKey, index) => {
          const isSelected = selected.includes(usageKey);
          const Icon = usageIconMap[usageKey];
          const label = usageLabels[usageKey];
          const description = usageDescriptions[usageKey];

          return (
            <motion.div
              key={usageKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="w-full"
            >
              <Card
                isPressable
                onPress={() => handleCardClick(usageKey)}
                className={`w-full cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-2 border-[var(--color-primary)] bg-[rgba(var(--color-primary-rgb),0.05)] shadow-md'
                    : 'border-2 border-[rgba(var(--color-primary-rgb),0.2)] bg-white hover:border-[rgba(var(--color-primary-rgb),0.5)] hover:shadow-sm'
                }`}
              >
                <CardBody className="p-3 flex flex-row items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold text-sm transition-colors ${
                        isSelected ? 'text-[var(--color-primary)]' : 'text-neutral-800'
                      }`}
                    >
                      {label}
                    </h3>
                    <p className="text-xs text-neutral-500 truncate hidden sm:block">
                      {description}
                    </p>
                  </div>

                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
