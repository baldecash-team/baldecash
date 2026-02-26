'use client';

import React from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { GraduationCap, Palette, Briefcase, Gamepad2, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { UsageType } from '../../types/catalog';

interface QuickUsageCardsProps {
  selected: UsageType[];
  onChange: (usage: UsageType[]) => void;
  className?: string;
}

// The 4 main quick usage cards - fixed structure like v0.5
const quickUsageCards: Array<{
  value: UsageType;
  label: string;
  icon: LucideIcon;
  description: string;
}> = [
  { value: 'estudios', label: 'Para estudiar', icon: GraduationCap, description: 'Clases online, investigación y proyectos' },
  { value: 'diseno', label: 'Para crear', icon: Palette, description: 'Diseño gráfico, video y fotografía' },
  { value: 'oficina', label: 'Para trabajar', icon: Briefcase, description: 'Excel, reuniones y multitarea' },
  { value: 'gaming', label: 'Para jugar', icon: Gamepad2, description: 'Juegos, streaming y multimedia' },
];

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
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickUsageCards.map((card, index) => {
          const isSelected = selected.includes(card.value);
          const Icon = card.icon;

          return (
            <motion.div
              key={card.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="w-full"
            >
              <Card
                isPressable
                onPress={() => handleCardClick(card.value)}
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
                      {card.label}
                    </h3>
                    <p className="text-xs text-neutral-500 truncate hidden sm:block">
                      {card.description}
                    </p>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center shrink-0"
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
