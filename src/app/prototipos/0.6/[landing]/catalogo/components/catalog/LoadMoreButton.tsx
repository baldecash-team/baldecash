'use client';

import React from 'react';
import { Button } from '@nextui-org/react';
import { ChevronDown, Plus, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { LoadMoreVersion } from '../../types/catalog';

interface LoadMoreButtonProps {
  version: LoadMoreVersion;
  remainingProducts: number;
  totalProducts: number;
  visibleProducts: number;
  onLoadMore: () => void;
}

/**
 * V1 - Minimal Line
 * Línea sutil con texto centrado, estilo minimalista
 */
const LoadMoreV1: React.FC<Omit<LoadMoreButtonProps, 'version'>> = ({
  remainingProducts,
  onLoadMore,
}) => (
  <div className="col-span-full py-8">
    <div className="flex items-center gap-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-200 to-neutral-200" />
      <button
        onClick={onLoadMore}
        className="group flex items-center gap-2 px-4 py-2 text-sm text-neutral-500 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
      >
        <span>Mostrar más</span>
        <span className="text-neutral-400 group-hover:text-[var(--color-primary)]">
          ({remainingProducts})
        </span>
        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
      </button>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-neutral-200 to-neutral-200" />
    </div>
  </div>
);

/**
 * V2 - Progress Bar
 * Muestra una barra de progreso visual con el porcentaje cargado
 */
const LoadMoreV2: React.FC<Omit<LoadMoreButtonProps, 'version'>> = ({
  remainingProducts,
  totalProducts,
  visibleProducts,
  onLoadMore,
}) => {
  const progress = Math.round((visibleProducts / totalProducts) * 100);

  return (
    <div className="col-span-full py-8">
      <div className="max-w-md mx-auto">
        {/* Progress info */}
        <div className="flex justify-between items-center mb-2 text-xs text-neutral-500">
          <span>
            Mostrando {visibleProducts} de {totalProducts} productos
          </span>
          <span className="font-medium text-[var(--color-primary)]">{progress}%</span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden mb-4">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Load more button */}
        <Button
          variant="flat"
          className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer transition-colors"
          onPress={onLoadMore}
          startContent={<Plus className="w-4 h-4" />}
        >
          Cargar {Math.min(remainingProducts, 6)} más
        </Button>
      </div>
    </div>
  );
};

/**
 * V3 - Gradient CTA
 * Botón prominente con gradiente de marca y animación
 */
const LoadMoreV3: React.FC<Omit<LoadMoreButtonProps, 'version'>> = ({
  remainingProducts,
  onLoadMore,
}) => (
  <div className="col-span-full py-10">
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Decorative dots */}
      <div className="flex gap-1 mb-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--color-primary-rgb),0.4)]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Main button */}
      <motion.button
        onClick={onLoadMore}
        className="group relative px-8 py-4 rounded-2xl bg-[var(--color-primary)] text-white font-semibold shadow-lg shadow-[rgba(var(--color-primary-rgb),0.25)] cursor-pointer overflow-hidden hover:brightness-90"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

        <div className="relative flex items-center gap-3">
          <span>Descubrir más equipos</span>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>
      </motion.button>

      {/* Remaining count */}
      <p className="mt-3 text-sm text-neutral-400">
        {remainingProducts} equipos más disponibles
      </p>
    </motion.div>
  </div>
);

/**
 * LoadMoreButton
 * Componente wrapper que renderiza la versión seleccionada
 */
export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  version,
  remainingProducts,
  totalProducts,
  visibleProducts,
  onLoadMore,
}) => {
  const props = { remainingProducts, totalProducts, visibleProducts, onLoadMore };

  switch (version) {
    case 1:
      return <LoadMoreV1 {...props} />;
    case 2:
      return <LoadMoreV2 {...props} />;
    case 3:
      return <LoadMoreV3 {...props} />;
    default:
      return <LoadMoreV1 {...props} />;
  }
};
