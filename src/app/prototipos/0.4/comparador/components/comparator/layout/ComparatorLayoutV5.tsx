'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Tooltip, Chip } from '@nextui-org/react';
import {
  X,
  Trash2,
  Scale,
  Plus,
  Check,
  ChevronRight,
  ArrowRight,
  Trophy,
  TrendingDown,
  Zap
} from 'lucide-react';
import { ComparatorLayoutProps } from '../../../types/comparator';
import { ComparisonTableV1 } from '../table/ComparisonTableV1';
import { compareSpecs, calculatePriceDifference, ComparisonProduct } from '../../../types/comparator';

/**
 * ComparatorLayoutV5 - Split 50/50
 * Layout de dos columnas: catálogo/lista izquierda + comparación derecha
 * Hover para añadir productos, experiencia fluida
 * Referencia: Notion, Figma panels, Linear split view
 */
export const ComparatorLayoutV5: React.FC<
  ComparatorLayoutProps & {
    availableProducts?: ComparisonProduct[];
    onAddProduct?: (product: ComparisonProduct) => void;
  }
> = ({
  products,
  config,
  onRemoveProduct,
  onClearAll,
  comparisonState,
  onStateChange,
  availableProducts = [],
  onAddProduct,
}) => {
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const specs = compareSpecs(products);
  const priceDiff = calculatePriceDifference(products);

  const maxProducts = config.maxProductsVersion;
  const canAddMore = products.length < maxProducts;

  // Filter out already selected products
  const selectableProducts = availableProducts.filter(
    p => !products.find(sp => sp.id === p.id)
  );

  const handleAddProduct = (product: ComparisonProduct) => {
    if (canAddMore && onAddProduct) {
      onAddProduct(product);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-50 z-50 flex">
      {/* LEFT PANEL - Product Catalog/List */}
      <motion.div
        initial={{ x: -400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-[45%] bg-white border-r border-neutral-200 flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-neutral-800 font-['Baloo_2']">
              Catálogo de Equipos
            </h3>
            <Chip size="sm" className="bg-[#4654CD]/10 text-[#4654CD] font-medium">
              {selectableProducts.length} disponibles
            </Chip>
          </div>
          <p className="text-sm text-neutral-500">
            {canAddMore
              ? `Selecciona hasta ${maxProducts - products.length} equipos más para comparar`
              : 'Límite alcanzado. Elimina un equipo para añadir otro.'}
          </p>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {selectableProducts.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <Scale className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay más equipos disponibles</p>
            </div>
          ) : (
            selectableProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => setHoveredProductId(null)}
              >
                <Card
                  isPressable={canAddMore}
                  isHoverable={canAddMore}
                  onPress={() => handleAddProduct(product)}
                  className={`p-4 cursor-pointer transition-all ${
                    !canAddMore ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    hoveredProductId === product.id && canAddMore
                      ? 'border-[#4654CD] shadow-lg shadow-[#4654CD]/10'
                      : 'border-neutral-200'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 flex-shrink-0 bg-neutral-50 rounded-lg flex items-center justify-center">
                      <img
                        src={product.thumbnail}
                        alt={product.displayName}
                        className="w-16 h-16 object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-neutral-800 line-clamp-2 mb-1">
                        {product.displayName}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-[#4654CD]">
                          S/{product.quotaMonthly}
                        </span>
                        <span className="text-xs text-neutral-400">/mes</span>
                      </div>
                      <div className="flex gap-2 text-xs text-neutral-500">
                        <span>{product.specs.processor.model}</span>
                        <span>•</span>
                        <span>{product.specs.ram.size}GB RAM</span>
                      </div>
                    </div>

                    {/* Add Button */}
                    <AnimatePresence>
                      {hoveredProductId === product.id && canAddMore && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="flex-shrink-0"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4654CD] to-[#03DBD0] flex items-center justify-center shadow-lg">
                            <Plus className="w-5 h-5 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* RIGHT PANEL - Comparison View */}
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-[55%] bg-neutral-50 flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4654CD] to-[#03DBD0] flex items-center justify-center shadow-lg shadow-[#4654CD]/20">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-800 font-['Baloo_2']">
                  Comparación
                </h2>
                <p className="text-sm text-neutral-500">
                  {products.length} de {maxProducts} equipos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {priceDiff.annualSaving > 0 && (
                <Chip
                  startContent={<Zap className="w-3 h-3" />}
                  className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-medium"
                >
                  Ahorra S/{priceDiff.annualSaving}/año
                </Chip>
              )}
            </div>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {products.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4654CD]/10 to-[#03DBD0]/10 flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="w-10 h-10 text-[#4654CD]" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800 mb-2 font-['Baloo_2']">
                  Comienza tu comparación
                </h3>
                <p className="text-neutral-500 text-sm">
                  Selecciona equipos del catálogo de la izquierda para comenzar a compararlos
                </p>
              </div>
            </div>
          ) : products.length === 1 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <Check className="w-16 h-16 text-[#22c55e] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-neutral-800 mb-2 font-['Baloo_2']">
                  Añade otro equipo
                </h3>
                <p className="text-neutral-500 text-sm mb-4">
                  Necesitas al menos 2 equipos para ver la comparación
                </p>
                <div className="bg-white rounded-xl p-4 border border-neutral-200">
                  <img
                    src={products[0].thumbnail}
                    alt={products[0].displayName}
                    className="w-24 h-24 object-contain mx-auto mb-3"
                  />
                  <p className="text-sm font-semibold text-neutral-800">
                    {products[0].displayName}
                  </p>
                  <p className="text-lg font-bold text-[#4654CD] mt-2">
                    S/{products[0].quotaMonthly}/mes
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Products Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                {products.map((product, index) => {
                  const isCheapest = priceDiff.quota[index] === 0;

                  return (
                    <Card key={product.id} className="p-4 border border-neutral-200 relative">
                      {isCheapest && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <div className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                            <TrendingDown className="w-3 h-3" />
                            MÁS ECONÓMICO
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => onRemoveProduct(product.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-neutral-100 hover:bg-red-100 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <X className="w-3 h-3 text-neutral-500 hover:text-red-500" />
                      </button>

                      <img
                        src={product.thumbnail}
                        alt={product.displayName}
                        className="w-20 h-20 object-contain mx-auto mb-2"
                      />
                      <h4 className="text-sm font-semibold text-neutral-800 text-center line-clamp-2 mb-2">
                        {product.displayName}
                      </h4>
                      <p className="text-xl font-bold text-center bg-gradient-to-r from-[#4654CD] to-[#03DBD0] bg-clip-text text-transparent">
                        S/{product.quotaMonthly}
                        <span className="text-xs font-normal text-neutral-500">/mes</span>
                      </p>
                      {priceDiff.quota[index] > 0 && (
                        <p className="text-xs text-red-500 text-center mt-1">
                          +S/{priceDiff.quota[index]}/mes más caro
                        </p>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Comparison Table */}
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                <ComparisonTableV1
                  products={products}
                  specs={specs}
                  showOnlyDifferences={comparisonState.showOnlyDifferences}
                  highlightVersion={config.highlightVersion}
                  config={config}
                />
              </div>

              {/* Toggle for differences */}
              <div className="flex items-center justify-center">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={comparisonState.showOnlyDifferences}
                      onChange={(e) => onStateChange({
                        ...comparisonState,
                        showOnlyDifferences: e.target.checked,
                      })}
                      className="peer sr-only"
                    />
                    <div className="w-11 h-6 bg-neutral-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-[#4654CD] peer-checked:to-[#03DBD0] transition-all cursor-pointer"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-md"></div>
                  </div>
                  <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors">
                    Solo mostrar diferencias
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
                <Button
                  variant="light"
                  startContent={<Trash2 className="w-4 h-4" />}
                  onPress={onClearAll}
                  className="cursor-pointer text-neutral-600 hover:text-red-500"
                >
                  Limpiar todo
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#4654CD] to-[#03DBD0] text-white cursor-pointer font-bold shadow-lg shadow-[#4654CD]/30"
                  endContent={<ChevronRight className="w-4 h-4" />}
                  onPress={() => {
                    const cheapestIdx = priceDiff.quota.indexOf(0);
                    console.log('Ver mejor opción:', products[cheapestIdx]);
                  }}
                >
                  Elegir mejor opción
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
