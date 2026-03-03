'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { EmptyActionsProps } from '../../../types/empty';

/**
 * EmptyActionsV6 - CTA Grande
 * Un solo botón "Ver todos los productos" centrado
 * Referencia: Spotify, Apple - CTA prominente y simple
 */
export const EmptyActionsV6: React.FC<EmptyActionsProps> = ({
  onClearFilters,
}) => {
  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Button
        size="lg"
        className="bg-[var(--color-primary)] text-white px-10 py-6 text-lg font-semibold cursor-pointer hover:brightness-90 transition-colors shadow-lg shadow-[rgba(var(--color-primary-rgb),0.25)]"
        endContent={<ArrowRight className="w-5 h-5" />}
        onPress={onClearFilters}
      >
        Ver todos los equipos
      </Button>

      <p className="text-sm text-neutral-500">
        Quita los filtros para explorar el catálogo completo
      </p>
    </motion.div>
  );
};
