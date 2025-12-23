'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Chip } from '@nextui-org/react';
import {
  X,
  Trophy,
  TrendingDown,
  Zap,
  Crown,
  Check,
  ChevronRight,
  Star,
  Sparkles
} from 'lucide-react';
import { ComparatorLayoutProps } from '../../../types/comparator';
import { compareSpecs, calculatePriceDifference } from '../../../types/comparator';

/**
 * ComparatorLayoutV6 - Fullscreen Inmersivo
 * Experiencia de página completa con imágenes grandes
 * Tipografía bold para specs ganadoras
 * Jerarquía visual dramática, CTA centrado
 * Referencia: Spotify, Apple product pages, Tesla configurator
 */
export const ComparatorLayoutV6: React.FC<ComparatorLayoutProps & { onClose: () => void }> = ({
  products,
  config,
  onRemoveProduct,
  onClearAll,
  comparisonState,
  onStateChange,
  onClose,
}) => {
  const specs = compareSpecs(products);
  const priceDiff = calculatePriceDifference(products);

  if (products.length < 2) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center text-white max-w-lg">
          <X className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-3xl font-bold mb-2 font-['Baloo_2']">
            Necesitas al menos 2 equipos
          </h2>
          <p className="text-white/70 mb-6">
            Selecciona más equipos para usar la comparación inmersiva
          </p>
          <Button
            onPress={onClose}
            className="bg-white text-black cursor-pointer font-bold"
          >
            Volver al catálogo
          </Button>
        </div>
      </div>
    );
  }

  // Find winner and cheapest
  const bestSpecs = specs
    .filter(s => s.category !== 'price')
    .reduce((acc, spec) => {
      const winnerIdx = spec.winner ?? -1;
      if (winnerIdx !== -1) {
        acc[winnerIdx] = (acc[winnerIdx] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

  const overallWinner = Object.entries(bestSpecs).reduce(
    (max, [idx, count]) => (count > max.count ? { idx: parseInt(idx), count } : max),
    { idx: 0, count: 0 }
  ).idx;

  const cheapestIdx = priceDiff.quota.indexOf(0);
  const winnerProduct = products[overallWinner];
  const cheapestProduct = products[cheapestIdx];

  // Key differentiating specs
  const keySpecs = specs.filter(s =>
    s.isDifferent && ['processor', 'ram', 'storage', 'displaySize', 'price', 'quota'].includes(s.key)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-black via-neutral-900 to-black z-50 overflow-y-auto"
    >
      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onClose}
        className="fixed top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl hover:bg-white/20 flex items-center justify-center cursor-pointer transition-all group"
      >
        <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
      </motion.button>

      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-8 py-20">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4654CD] to-[#03DBD0] px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Comparación Inteligente
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 font-['Baloo_2']">
            Tu Mejor Elección
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Hemos analizado cada especificación para ayudarte a decidir
          </p>
        </motion.div>

        {/* Products Comparison - Large Images */}
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-2 gap-8 mb-12">
            {products.map((product, index) => {
              const isWinner = index === overallWinner;
              const isCheapest = index === cheapestIdx;
              const winCount = bestSpecs[index] || 0;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`relative group ${
                    isWinner ? 'col-span-2 md:col-span-1' : ''
                  }`}
                >
                  {/* Winner Badge */}
                  <AnimatePresence>
                    {isWinner && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute -top-6 left-1/2 -translate-x-1/2 z-10"
                      >
                        <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-2xl shadow-amber-500/50">
                          <Crown className="w-5 h-5" />
                          <span className="text-lg">GANADOR</span>
                          <Crown className="w-5 h-5" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className={`relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border-2 transition-all ${
                    isWinner
                      ? 'border-amber-500 shadow-2xl shadow-amber-500/20'
                      : isCheapest
                      ? 'border-[#22c55e] shadow-xl shadow-[#22c55e]/20'
                      : 'border-white/10 hover:border-white/30'
                  }`}>
                    {/* Remove Button */}
                    <button
                      onClick={() => onRemoveProduct(product.id)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/20 flex items-center justify-center cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>

                    {/* Product Image - Large */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="mb-6"
                    >
                      <img
                        src={product.thumbnail}
                        alt={product.displayName}
                        className="w-full h-64 object-contain"
                      />
                    </motion.div>

                    {/* Product Name */}
                    <h3 className="text-2xl font-bold text-white mb-4 text-center font-['Baloo_2']">
                      {product.displayName}
                    </h3>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {isCheapest && (
                        <Chip
                          startContent={<TrendingDown className="w-3 h-3" />}
                          className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-bold"
                        >
                          MÁS ECONÓMICO
                        </Chip>
                      )}
                      {winCount > 0 && (
                        <Chip
                          startContent={<Trophy className="w-3 h-3" />}
                          className="bg-white/10 text-white font-medium backdrop-blur-xl"
                        >
                          {winCount} specs superiores
                        </Chip>
                      )}
                    </div>

                    {/* Price - Large */}
                    <div className="text-center mb-6">
                      <p className="text-5xl font-black bg-gradient-to-r from-[#4654CD] to-[#03DBD0] bg-clip-text text-transparent mb-2">
                        S/{product.quotaMonthly}
                      </p>
                      <p className="text-white/70 text-lg">/mes por 24 meses</p>
                      {priceDiff.quota[index] > 0 && (
                        <p className="text-red-400 text-sm mt-2 font-medium">
                          +S/{priceDiff.quota[index]}/mes más caro
                        </p>
                      )}
                      <p className="text-white/50 text-sm mt-1">
                        Total: S/{product.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Key Specs */}
                    <div className="space-y-3">
                      {keySpecs.slice(0, 4).map((spec) => {
                        const isSpecWinner = spec.winner === index;
                        const value = spec.values[index];

                        return (
                          <div
                            key={spec.key}
                            className={`flex items-center justify-between px-4 py-2 rounded-lg ${
                              isSpecWinner
                                ? 'bg-gradient-to-r from-[#22c55e]/20 to-transparent'
                                : 'bg-white/5'
                            }`}
                          >
                            <span className="text-white/70 text-sm">{spec.label}</span>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${
                                isSpecWinner ? 'text-[#22c55e] text-lg' : 'text-white'
                              }`}>
                                {value}
                              </span>
                              {isSpecWinner && <Check className="w-4 h-4 text-[#22c55e]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Price Difference Highlight */}
          {priceDiff.annualSaving > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-12"
            >
              <div className="inline-block bg-gradient-to-r from-[#22c55e]/20 to-[#16a34a]/20 border border-[#22c55e]/30 backdrop-blur-xl rounded-2xl px-8 py-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-[#22c55e]" />
                  <div>
                    <p className="text-white/70 text-sm">Ahorro anual eligiendo el más económico</p>
                    <p className="text-3xl font-black text-[#22c55e]">
                      S/{priceDiff.annualSaving}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CTA Section - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex flex-col items-center gap-4">
              <p className="text-white/70 text-lg mb-2">
                ¿Listo para tomar la mejor decisión?
              </p>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  variant="bordered"
                  onPress={onClearAll}
                  className="cursor-pointer border-white/30 text-white hover:border-white/60 font-medium px-8"
                >
                  Comparar otros equipos
                </Button>

                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#4654CD] to-[#03DBD0] text-white cursor-pointer font-bold shadow-2xl shadow-[#4654CD]/40 hover:shadow-[#4654CD]/60 transition-all px-12 text-lg"
                  endContent={<ChevronRight className="w-5 h-5" />}
                  onPress={() => {
                    console.log('Elegir ganador:', winnerProduct);
                  }}
                >
                  Elegir {overallWinner === cheapestIdx ? 'esta opción' : 'el ganador'}
                </Button>
              </div>

              <p className="text-white/50 text-sm mt-4">
                {overallWinner === cheapestIdx
                  ? 'El mejor rendimiento al mejor precio'
                  : `O elige el más económico y ahorra S/${priceDiff.annualSaving}/año`
                }
              </p>
            </div>
          </motion.div>

          {/* Toggle differences */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center mt-12"
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
                <div className="w-14 h-7 bg-white/10 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-[#4654CD] peer-checked:to-[#03DBD0] transition-all cursor-pointer"></div>
                <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-7 shadow-lg"></div>
              </div>
              <span className="text-base font-medium text-white/90 group-hover:text-white transition-colors">
                Modo enfocado (solo diferencias)
              </span>
            </label>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-xl border-t border-white/10 py-4 px-8"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Star className="w-4 h-4" />
            <span>Comparación basada en {specs.length} especificaciones</span>
          </div>
          <div className="text-white/50 text-sm">
            BaldeCash • Tu camino hacia la tecnología
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
