'use client';

import React from 'react';
import { Card, CardBody, Chip } from '@nextui-org/react';
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
  /**
   * Preset `features.has_usage_chips` (BAL-3880). En mobile, cambia las 4
   * cards 2x2 de siempre por chips en una sola fila. No afecta desktop, que
   * siempre muestra las cards. Default `false`.
   */
  chipsEnMobile?: boolean;
}

// The 4 main quick usage cards - use centralized registry
const quickUsageCardKeys: UsageType[] = ['estudios', 'diseno', 'oficina', 'gaming'];

// Las etiquetas del backend vienen con el prefijo "Para" ("Para estudiar"),
// pensado para la card de desktop ("Para estudiar" + descripción debajo). El
// chip de mobile es una sola palabra corta y no tiene espacio para el
// prefijo, pero el texto sigue siendo del backend: solo se recorta acá,
// nunca en el origen, así que desktop no se toca. Tras quitar "Para " la
// palabra queda en minúscula ("estudiar"); se capitaliza la primera letra
// para que el chip lea "Estudiar" como pide el diseño.
const quitarPrefijoPara = (label: string) => {
  const sinPrefijo = label.startsWith('Para ') ? label.slice('Para '.length) : label;
  return sinPrefijo.charAt(0).toUpperCase() + sinPrefijo.slice(1);
};

/**
 * QuickUsageCards - Selector rápido de uso con cards visuales
 * Permite filtrar rápidamente por tipo de uso sin usar el sidebar
 * Siempre muestra las 4 cards principales: estudiar, crear, trabajar, jugar
 */
export const QuickUsageCards: React.FC<QuickUsageCardsProps> = ({
  selected,
  onChange,
  className = 'mb-8',
  chipsEnMobile = false,
}) => {
  const handleCardClick = (value: UsageType) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  return (
    <div className={className}>
      {/* Chips (mobile, solo con el preset encendido) */}
      {chipsEnMobile && (
        <div className="grid grid-cols-4 gap-2 md:hidden">
          {quickUsageCardKeys.map((usageKey) => {
            const isSelected = selected.includes(usageKey);
            const Icon = usageIconMap[usageKey];
            const label = quitarPrefijoPara(usageLabels[usageKey]);

            return (
              <Chip
                key={usageKey}
                as="button"
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleCardClick(usageKey)}
                variant="flat"
                classNames={{
                  base: `w-full h-9 max-w-full justify-center border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#4654CD] border-[#4654CD]'
                      : 'bg-white border-[#DCDFEE]'
                  }`,
                  content: 'flex items-center justify-center gap-1 px-1 w-full',
                }}
                style={{ borderRadius: 999 }}
              >
                <span className="flex items-center justify-center gap-1 min-w-0">
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 max-[370px]:hidden ${
                      isSelected ? 'text-white' : 'text-[var(--text-muted,#4b5563)]'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium truncate ${
                      isSelected ? 'text-white' : 'text-[var(--text,#374151)]'
                    }`}
                  >
                    {label}
                  </span>
                </span>
              </Chip>
            );
          })}
        </div>
      )}

      {/* Cards clásicas 2x2 en mobile / 4 en desktop. Con el preset
          encendido, en mobile quedan ocultas (los chips de arriba las
          reemplazan); desktop nunca cambia. */}
      <div
        className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${
          chipsEnMobile ? 'hidden md:grid' : ''
        }`}
      >
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
                    : 'border-2 border-[rgba(var(--color-primary-rgb),0.2)] bg-[var(--surface,#fff)] hover:border-[rgba(var(--color-primary-rgb),0.5)] hover:shadow-sm'
                }`}
              >
                <CardBody className="p-3 flex flex-row items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--surface-2,#f3f4f6)] text-[var(--text-muted,#4b5563)]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold text-sm transition-colors ${
                        isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--text-strong,#1f2937)]'
                      }`}
                    >
                      {label}
                    </h3>
                    <p className="text-xs text-[var(--text-muted,#6b7280)] truncate hidden sm:block">
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
