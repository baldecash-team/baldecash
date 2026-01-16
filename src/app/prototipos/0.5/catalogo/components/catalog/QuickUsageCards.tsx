'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { GraduationCap, Palette, Briefcase, Gamepad2, Search } from 'lucide-react';
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
          <Search className="w-5 h-5 text-[#4654CD]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-800 font-['Baloo_2']">
            Encuentra tu laptop ideal
          </h2>
          <p className="text-sm text-neutral-500">
            Selecciona según tu necesidad principal
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {usageCardOptions.map((option, index) => {
          const isSelected = selected.includes(option.value);

          return (
            <motion.div
              key={option.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="w-full"
            >
              <Card
                isPressable
                onPress={() => handleCardClick(option.value)}
                className={`w-full h-full cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-2 border-[#4654CD] bg-[#4654CD]/5 shadow-md'
                    : 'border-2 border-[#4654CD]/20 bg-white hover:border-[#4654CD]/50 hover:shadow-sm'
                }`}
              >
                <CardBody className="p-4 flex flex-col items-center text-center sm:items-start sm:text-left gap-2">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#4654CD] text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {option.icon}
                  </div>

                  {/* Label */}
                  <h3
                    className={`font-semibold text-sm transition-colors ${
                      isSelected ? 'text-[#4654CD]' : 'text-neutral-800'
                    }`}
                  >
                    {option.label}
                  </h3>

                  {/* Description - Hidden on mobile for space */}
                  <p className="text-xs text-neutral-500 hidden sm:block">
                    {option.description}
                  </p>

                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#4654CD] flex items-center justify-center"
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
