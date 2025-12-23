'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from '@nextui-org/react';
import { X, Trash2, Scale, Trophy, TrendingDown, Zap, Crown } from 'lucide-react';
import { ComparatorLayoutProps } from '../../../types/comparator';
import { ComparisonTableV1 } from '../table/ComparisonTableV1';
import { compareSpecs, calculatePriceDifference } from '../../../types/comparator';

/**
 * ComparatorLayoutV4 - Modal Fluido Fintech
 * Modal con animaciones suaves, gradientes, badges flotantes
 * Micro-interacciones en hover
 * Referencia: Nubank, Revolut, N26
 */
export const ComparatorLayoutV4: React.FC<ComparatorLayoutProps & { isOpen: boolean; onClose: () => void }> = ({
  products,
  config,
  onRemoveProduct,
  onClearAll,
  comparisonState,
  onStateChange,
  isOpen,
  onClose,
}) => {
  const specs = compareSpecs(products);
  const priceDiff = calculatePriceDifference(products);

  if (products.length === 0) {
    return null;
  }

  // Find best overall product (lowest price + best specs)
  const bestProductIndex = specs
    .filter(s => s.category !== 'price')
    .reduce((acc, spec) => {
      const winnerIdx = spec.winner ?? -1;
      if (winnerIdx !== -1) {
        acc[winnerIdx] = (acc[winnerIdx] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

  const overallWinner = Object.entries(bestProductIndex).reduce(
    (max, [idx, count]) => (count > max.count ? { idx: parseInt(idx), count } : max),
    { idx: 0, count: 0 }
  ).idx;

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="full"
          scrollBehavior="outside"
          backdrop="blur"
          classNames={{
            base: 'bg-gradient-to-br from-white via-[#4654CD]/5 to-[#03DBD0]/5 m-0 rounded-none',
            wrapper: 'p-0',
            backdrop: 'bg-gradient-to-br from-[#4654CD]/20 via-black/50 to-[#03DBD0]/20',
            header: 'border-b border-neutral-200/50 bg-white/80 backdrop-blur-xl py-4',
            body: 'bg-transparent py-6 px-4 md:px-8',
            footer: 'border-t border-neutral-200/50 bg-white/80 backdrop-blur-xl',
            closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
          }}
          motionProps={{
            variants: {
              enter: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.4,
                  ease: [0.36, 0.66, 0.04, 1],
                },
              },
              exit: {
                y: 50,
                opacity: 0,
                transition: {
                  duration: 0.3,
                  ease: [0.36, 0.66, 0.04, 1],
                },
              },
            },
          }}
        >
          <ModalContent>
            <ModalHeader className="flex items-center justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4654CD] to-[#03DBD0] flex items-center justify-center shadow-lg shadow-[#4654CD]/20">
                  <Scale className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800 font-['Baloo_2']">
                    Comparador Inteligente
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {products.length} equipos • Encuentra tu mejor opción
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Chip
                  startContent={<Zap className="w-3 h-3" />}
                  className="bg-gradient-to-r from-[#4654CD] to-[#03DBD0] text-white font-medium"
                >
                  Ahorra hasta S/{priceDiff.annualSaving}/año
                </Chip>
              </motion.div>
            </ModalHeader>

            <ModalBody>
              {/* Products Header Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-neutral-200/50 overflow-hidden mb-6 shadow-xl shadow-neutral-900/5"
              >
                <div className="grid" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
                  {/* Empty corner cell */}
                  <div className="p-4 border-b border-r border-neutral-200/50 bg-gradient-to-br from-neutral-50/50 to-transparent" />

                  {/* Product headers */}
                  {products.map((product, index) => {
                    const isWinner = index === overallWinner;
                    const isCheapest = priceDiff.quota[index] === 0;

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 border-b border-neutral-200/50 relative ${
                          index < products.length - 1 ? 'border-r border-neutral-200/50' : ''
                        } ${isWinner ? 'bg-gradient-to-br from-[#4654CD]/5 to-[#03DBD0]/5' : ''}`}
                      >
                        {/* Winner Badge */}
                        <AnimatePresence>
                          {isWinner && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
                            >
                              <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-amber-500/30">
                                <Crown className="w-3 h-3" />
                                MEJOR EQUIPO
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Cheapest Badge */}
                        <AnimatePresence>
                          {isCheapest && !isWinner && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
                            >
                              <div className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-green-500/30">
                                <TrendingDown className="w-3 h-3" />
                                MÁS ECONÓMICO
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="relative">
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onRemoveProduct(product.id)}
                            className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-neutral-100 hover:bg-red-100 flex items-center justify-center cursor-pointer transition-colors shadow-md"
                          >
                            <X className="w-4 h-4 text-neutral-500 hover:text-red-500" />
                          </motion.button>

                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <img
                              src={product.thumbnail}
                              alt={product.displayName}
                              className="w-28 h-28 object-contain mx-auto mb-3"
                            />
                          </motion.div>

                          <h3 className="text-sm font-semibold text-neutral-800 text-center line-clamp-2 mb-3">
                            {product.displayName}
                          </h3>

                          <div className="text-center space-y-2">
                            <div className="relative">
                              <p className="text-2xl font-bold bg-gradient-to-r from-[#4654CD] to-[#03DBD0] bg-clip-text text-transparent">
                                S/{product.quotaMonthly}
                                <span className="text-sm font-normal text-neutral-500">/mes</span>
                              </p>

                              {/* Price Difference Badge */}
                              {priceDiff.quota[index] > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="mt-1"
                                >
                                  <span className="inline-block text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                    +S/{priceDiff.quota[index]}/mes
                                  </span>
                                </motion.div>
                              )}
                            </div>

                            <p className="text-xs text-neutral-400">
                              Total: S/{product.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Comparison Table */}
                <ComparisonTableV1
                  products={products}
                  specs={specs}
                  showOnlyDifferences={comparisonState.showOnlyDifferences}
                  highlightVersion={config.highlightVersion}
                  config={config}
                />
              </motion.div>

              {/* Toggle for differences */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-4"
              >
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
              </motion.div>
            </ModalBody>

            <ModalFooter className="flex justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="light"
                  startContent={<Trash2 className="w-4 h-4" />}
                  onPress={onClearAll}
                  className="cursor-pointer text-neutral-600 hover:text-red-500 font-medium"
                >
                  Limpiar comparación
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3"
              >
                <Button
                  variant="bordered"
                  onPress={onClose}
                  className="cursor-pointer border-neutral-300 font-medium hover:border-neutral-400"
                >
                  Cerrar
                </Button>
                <Button
                  className="bg-gradient-to-r from-[#4654CD] to-[#03DBD0] text-white cursor-pointer font-bold shadow-lg shadow-[#4654CD]/30 hover:shadow-xl hover:shadow-[#4654CD]/40 transition-shadow"
                  startContent={<Trophy className="w-4 h-4" />}
                  onPress={() => {
                    console.log('Selecting best option:', products[overallWinner]);
                  }}
                >
                  Ver mejor opción
                </Button>
              </motion.div>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </AnimatePresence>
  );
};
