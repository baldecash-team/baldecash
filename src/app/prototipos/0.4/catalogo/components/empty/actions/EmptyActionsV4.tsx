'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, SlidersHorizontal, Sparkles } from 'lucide-react';
import { EmptyActionsProps } from '../../../types/empty';

/**
 * EmptyActionsV4 - Floating Pills
 * Pills flotantes con animación de hover
 * Referencia: Nubank, Revolut - estilo fintech con animaciones
 */
export const EmptyActionsV4: React.FC<EmptyActionsProps> = ({
  onClearFilters,
  onExpandPriceRange,
  totalProductsIfExpanded,
}) => {
  const pills = [
    {
      id: 'clear',
      label: 'Limpiar filtros',
      icon: RefreshCw,
      onClick: onClearFilters,
      bgColor: 'bg-[#4654CD]',
      hoverColor: 'hover:bg-[#3a47b3]',
      textColor: 'text-white',
    },
    {
      id: 'expand',
      label: totalProductsIfExpanded
        ? `Ampliar precio (${totalProductsIfExpanded})`
        : 'Ampliar precio',
      icon: SlidersHorizontal,
      onClick: onExpandPriceRange,
      bgColor: 'bg-white',
      hoverColor: 'hover:bg-neutral-50',
      textColor: 'text-neutral-800',
      border: true,
    },
    {
      id: 'discover',
      label: 'Descubrir equipos',
      icon: Sparkles,
      onClick: onClearFilters,
      bgColor: 'bg-[#03DBD0]/10',
      hoverColor: 'hover:bg-[#03DBD0]/20',
      textColor: 'text-[#02C3BA]',
    },
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {pills.map((pill, index) => (
        <motion.button
          key={pill.id}
          onClick={pill.onClick}
          className={`
            flex items-center gap-2 px-5 py-3 rounded-full font-medium
            ${pill.bgColor} ${pill.textColor} ${pill.hoverColor}
            ${pill.border ? 'border border-neutral-200 hover:border-[#4654CD]/50' : ''}
            cursor-pointer shadow-sm hover:shadow-md transition-all
          `}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <pill.icon className="w-4 h-4" />
          <span>{pill.label}</span>
        </motion.button>
      ))}
    </div>
  );
};
