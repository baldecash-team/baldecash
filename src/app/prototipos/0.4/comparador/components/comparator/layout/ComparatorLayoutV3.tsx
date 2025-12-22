'use client';

import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { X, Trash2, Scale, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComparatorLayoutProps } from '../../../types/comparator';
import { ComparisonTableV1 } from '../table/ComparisonTableV1';
import { compareSpecs } from '../../../types/comparator';

/**
 * ComparatorLayoutV3 - Panel Lateral Deslizante
 * Panel que se desliza desde la derecha con animación
 * Referencia: Airbnb filters, Shopping cart sidebars
 *
 * Características:
 * - Desliza desde la derecha hacia la izquierda
 * - Overlay oscuro con click para cerrar
 * - Ancho 500px en desktop, fullscreen en mobile
 * - Header sticky con acciones
 * - Contenido scrolleable
 */
export const ComparatorLayoutV3: React.FC<
  ComparatorLayoutProps & {
    isOpen?: boolean;
    onClose?: () => void;
  }
> = ({
  products,
  config,
  onRemoveProduct,
  onClearAll,
  comparisonState,
  onStateChange,
  isOpen = false,
  onClose = () => {},
}) => {
  const specs = compareSpecs(products);

  if (products.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={onClose}
          />

          {/* Panel deslizante */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white">
              <div className="flex items-center gap-3">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={onClose}
                  className="cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-neutral-600" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-[#4654CD]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-800 font-['Baloo_2']">
                      Comparador
                    </h2>
                    <p className="text-xs text-neutral-500">
                      {products.length} equipos seleccionados
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="light"
                  onPress={onClearAll}
                  className="cursor-pointer text-neutral-500 hover:text-red-500"
                  startContent={<Trash2 className="w-4 h-4" />}
                >
                  Limpiar
                </Button>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={onClose}
                  className="cursor-pointer sm:hidden"
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </Button>
              </div>
            </div>

            {/* Products Header - Horizontal scroll */}
            <div className="p-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-32 bg-white rounded-xl p-3 border border-neutral-200 relative group"
                  >
                    <button
                      onClick={() => onRemoveProduct(product.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-neutral-200 shadow-sm hover:bg-red-50 hover:border-red-200 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-neutral-500 hover:text-red-500" />
                    </button>

                    <div className="w-6 h-6 rounded-full bg-[#4654CD] text-white text-xs font-bold flex items-center justify-center mb-2">
                      {index + 1}
                    </div>

                    <img
                      src={product.thumbnail}
                      alt={product.displayName}
                      className="w-full h-16 object-contain mb-2"
                    />

                    <p className="text-xs font-medium text-neutral-800 line-clamp-2 mb-1">
                      {product.brand}
                    </p>

                    <p className="text-sm font-bold text-[#4654CD]">
                      S/{product.quotaMonthly}<span className="text-xs font-normal text-neutral-500">/mes</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Toggle diferencias */}
            <div className="px-4 py-3 border-b border-neutral-200 bg-white">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={comparisonState.showOnlyDifferences}
                  onChange={(e) => onStateChange({
                    ...comparisonState,
                    showOnlyDifferences: e.target.checked,
                  })}
                  className="w-4 h-4 rounded border-neutral-300 text-[#4654CD] focus:ring-[#4654CD] cursor-pointer"
                />
                <span className="text-sm text-neutral-700">
                  Solo mostrar diferencias
                </span>
              </label>
            </div>

            {/* Comparison Table - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              {products.length >= 2 ? (
                <ComparisonTableV1
                  products={products}
                  specs={specs}
                  showOnlyDifferences={comparisonState.showOnlyDifferences}
                  highlightVersion={config.highlightVersion}
                  config={config}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                    <Scale className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                    Añade otro equipo
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Selecciona al menos 2 equipos para ver la comparación
                  </p>
                </div>
              )}
            </div>

            {/* Footer con resumen */}
            {products.length >= 2 && (
              <div className="p-4 border-t border-neutral-200 bg-neutral-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-neutral-600">Mejor precio:</span>
                  <span className="text-lg font-bold text-green-600">
                    S/{Math.min(...products.map(p => p.quotaMonthly))}/mes
                  </span>
                </div>
                <Button
                  className="w-full bg-[#4654CD] text-white cursor-pointer"
                  size="lg"
                  onPress={onClose}
                >
                  Continuar explorando
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
