'use client';

/**
 * ComparatorLayoutV2 - Pagina Dedicada
 *
 * Comparador como pagina completa /comparador
 * Mas espacio, mejor para comparaciones extensas
 * Ideal para: usuarios que quieren analizar en detalle
 */

import React from 'react';
import { Button, Switch, Chip } from '@nextui-org/react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Trash2,
  GitCompareArrows,
  Settings,
  Share2,
} from 'lucide-react';
import { ComparatorLayoutProps } from '../../../types/comparator';

interface ComparatorLayoutV2Props extends ComparatorLayoutProps {
  showOnlyDifferences: boolean;
  onToggleDifferences: (value: boolean) => void;
  highlightWinners: boolean;
  onToggleHighlight: (value: boolean) => void;
  onOpenSettings?: () => void;
  onBack?: () => void;
}

export const ComparatorLayoutV2: React.FC<ComparatorLayoutV2Props> = ({
  config,
  products,
  onRemoveProduct,
  onClearAll,
  children,
  showOnlyDifferences,
  onToggleDifferences,
  highlightWinners,
  onToggleHighlight,
  onOpenSettings,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  isIconOnly
                  variant="light"
                  onPress={onBack}
                  className="cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#4654CD]/10 flex items-center justify-center">
                  <GitCompareArrows className="w-5 h-5 text-[#4654CD]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#4654CD] font-['Baloo_2']">
                    Comparador
                  </h1>
                  <p className="text-sm text-neutral-500">
                    {products.length} productos seleccionados
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="light"
                startContent={<Share2 className="w-4 h-4" />}
                className="hidden md:flex cursor-pointer"
              >
                Compartir
              </Button>
              {onOpenSettings && (
                <Button
                  isIconOnly
                  variant="light"
                  onPress={onOpenSettings}
                  className="cursor-pointer"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch
                  size="sm"
                  isSelected={showOnlyDifferences}
                  onValueChange={onToggleDifferences}
                  color="primary"
                  classNames={{
                    wrapper: 'group-data-[selected=true]:bg-[#4654CD]',
                  }}
                />
                <span className="text-sm text-neutral-600">
                  Solo diferencias
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch
                  size="sm"
                  isSelected={highlightWinners}
                  onValueChange={onToggleHighlight}
                  color="primary"
                  classNames={{
                    wrapper: 'group-data-[selected=true]:bg-[#4654CD]',
                  }}
                />
                <span className="text-sm text-neutral-600">
                  Resaltar mejor/peor
                </span>
              </label>
            </div>

            {/* Product Count + Clear */}
            <div className="flex items-center gap-3">
              <Chip
                size="sm"
                radius="sm"
                classNames={{
                  base: 'bg-[#4654CD]/10 px-2 py-0.5 h-auto',
                  content: 'text-[#4654CD] text-xs font-medium',
                }}
              >
                {products.length} / {config.maxProducts} productos
              </Chip>
              <Button
                size="sm"
                variant="light"
                color="danger"
                startContent={<Trash2 className="w-3 h-3" />}
                onPress={onClearAll}
                className="cursor-pointer"
              >
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
            <GitCompareArrows className="w-10 h-10 text-neutral-400" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            No hay productos para comparar
          </h2>
          <p className="text-neutral-500 mb-6">
            Agrega productos desde el catalogo para comenzar a comparar
          </p>
          {onBack && (
            <Button
              className="bg-[#4654CD] text-white cursor-pointer"
              onPress={onBack}
            >
              Ir al catalogo
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ComparatorLayoutV2;
