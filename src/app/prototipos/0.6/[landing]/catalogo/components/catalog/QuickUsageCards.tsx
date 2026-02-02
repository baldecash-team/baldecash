'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { GraduationCap, Palette, Briefcase, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { UsageType } from '../../types/catalog';

interface QuickUsageCardsProps {
  selected: UsageType[];
  onChange: (usage: UsageType[]) => void;
  className?: string;
}

interface UsageCardOption {
  value: UsageType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const usageCardOptions: UsageCardOption[] = [
  {
    value: 'estudios',
    label: 'Para estudiar',
    icon: <GraduationCap className="w-8 h-8" />,
    description: 'Clases online, investigación y proyectos',
  },
  {
    value: 'diseño',
    label: 'Para crear',
    icon: <Palette className="w-8 h-8" />,
    description: 'Diseño gráfico, video y fotografía',
  },
  {
    value: 'oficina',
    label: 'Para trabajar',
    icon: <Briefcase className="w-8 h-8" />,
    description: 'Excel, reuniones y multitarea',
  },
  {
    value: 'gaming',
    label: 'Para jugar',
    icon: <Gamepad2 className="w-8 h-8" />,
    description: 'Juegos, streaming y multimedia',
  },
];

/**
 * QuickUsageCards - Selector rápido de uso con cards visuales
 * Permite filtrar rápidamente por tipo de uso sin usar el sidebar
 * Referencia: Prototipo V9 - "Encuentra tu laptop ideal"
 */
export const QuickUsageCards: React.FC<QuickUsageCardsProps> = ({
  selected,
  onChange,
  className = 'mb-8',
}) => {
  const handleCardClick = (value: UsageType) => {
    if (selected.includes(value)) {
      // Deseleccionar
      onChange(selected.filter((v) => v !== value));
    } else {
      // Seleccionar (permite múltiple)
      onChange([...selected, value]);
    }
  };

  return (
    <div className={className}>
      {/* Cards Grid - Horizontal Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {usageCardOptions.map((option, index) => {
          const isSelected = selected.includes(option.value);

          return (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="w-full"
            >
              <Card
                isPressable
                onPress={() => handleCardClick(option.value)}
                className={`w-full cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-2 border-[#4654CD] bg-[#4654CD]/5 shadow-md'
                    : 'border-2 border-[#4654CD]/20 bg-white hover:border-[#4654CD]/50 hover:shadow-sm'
                }`}
              >
                <CardBody className="p-3 flex flex-row items-center gap-3">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-[#4654CD] text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {React.cloneElement(option.icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold text-sm transition-colors ${
                        isSelected ? 'text-[#4654CD]' : 'text-neutral-800'
                      }`}
                    >
                      {option.label}
                    </h3>
                    <p className="text-xs text-neutral-500 truncate hidden sm:block">
                      {option.description}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-[#4654CD] flex items-center justify-center shrink-0"
                    >
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
