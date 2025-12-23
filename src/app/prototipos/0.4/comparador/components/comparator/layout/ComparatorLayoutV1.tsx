'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { X, Trash2, Scale, ArrowRight, Trophy, Sparkles } from 'lucide-react';
import { ComparatorLayoutProps } from '../../../types/comparator';
import { ComparisonTableV1 } from '../table/ComparisonTableV1';
import { compareSpecs } from '../../../types/comparator';

/**
 * ComparatorLayoutV1 - Modal Fullscreen
 * Modal con overlay oscuro, experiencia inmersiva
 * Referencia: Amazon, Best Buy comparison modal
 */
export const ComparatorLayoutV1: React.FC<ComparatorLayoutProps & { isOpen: boolean; onClose: () => void }> = ({
  products,
  config,
  onRemoveProduct,
  onClearAll,
  comparisonState,
  onStateChange,
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCleanMode = searchParams.get('mode') === 'clean';
  const specs = compareSpecs(products);
  const [showBestOption, setShowBestOption] = useState(false);

  // Find the best option (lowest monthly quota)
  const bestProduct = useMemo(() => {
    if (products.length === 0) return null;
    return products.reduce((best, current) =>
      current.quotaMonthly < best.quotaMonthly ? current : best
    , products[0]);
  }, [products]);

  // Find index of best product
  const bestProductIndex = useMemo(() => {
    if (!bestProduct) return -1;
    return products.findIndex(p => p.id === bestProduct.id);
  }, [products, bestProduct]);

  const handleShowBestOption = () => {
    setShowBestOption(true);
  };

  const handleContinueWithBest = () => {
    // Navigate to upsell with the best product
    const baseUrl = '/prototipos/0.4/upsell/upsell-preview/?accessoryIntroVersion=3&sections=accessories';
    router.push(isCleanMode ? `${baseUrl}&mode=clean` : baseUrl);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      scrollBehavior="outside"
      backdrop="blur"
      classNames={{
        base: 'bg-white m-0 rounded-none',
        wrapper: 'p-0',
        backdrop: 'bg-black/70',
        header: 'border-b border-neutral-200 bg-white py-4',
        body: 'bg-neutral-50 py-6 px-4 md:px-8',
        footer: 'border-t border-neutral-200 bg-white',
        closeButton: 'top-4 right-4 hover:bg-neutral-100 rounded-lg cursor-pointer',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-[#4654CD]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-800 font-['Baloo_2']">
                Comparador de Equipos
              </h2>
              <p className="text-sm text-neutral-500">
                {products.length} equipos seleccionados
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          {/* Mini Product Cards - Horizontal scroll */}
          <div className="mb-6 pt-2 px-1">
            <div className="flex gap-3 overflow-x-auto pb-2 overflow-y-visible">
              {products.map((product, index) => {
                const isBest = showBestOption && index === bestProductIndex;
                return (
                  <div
                    key={product.id}
                    className={`flex-shrink-0 w-36 bg-white rounded-xl p-3 border relative group transition-all duration-300 ${
                      isBest
                        ? 'border-[#22c55e] ring-2 ring-[#22c55e]/30 shadow-lg'
                        : showBestOption
                        ? 'border-neutral-200 opacity-60'
                        : 'border-neutral-200'
                    }`}
                  >
                    {/* Best option badge - inside card */}
                    {isBest && (
                      <div className="bg-[#22c55e] text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center justify-center gap-1 mb-2">
                        <Trophy className="w-3 h-3" />
                        Mejor opción
                      </div>
                    )}

                    <button
                      onClick={() => onRemoveProduct(product.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-neutral-200 shadow-sm hover:bg-red-50 hover:border-red-200 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-neutral-500 hover:text-red-500" />
                    </button>

                    {!isBest && (
                      <div className="w-6 h-6 rounded-full bg-[#4654CD] text-white text-xs font-bold flex items-center justify-center mb-2">
                        {index + 1}
                      </div>
                    )}

                    <img
                      src={product.thumbnail}
                      alt={product.displayName}
                      className="w-full h-16 object-contain mb-2"
                    />

                    <p className="text-xs font-medium text-neutral-800 line-clamp-1 mb-1">
                      {product.brand}
                    </p>

                    <p className={`text-sm font-bold ${isBest ? 'text-[#22c55e]' : 'text-[#4654CD]'}`}>
                      S/{product.quotaMonthly}<span className="text-xs font-normal text-neutral-500">/mes</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Best option banner */}
          {showBestOption && bestProduct && (
            <div className="mb-4 p-4 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#22c55e] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">
                    {bestProduct.brand} {bestProduct.displayName}
                  </p>
                  <p className="text-xs text-neutral-600">
                    Mejor relación precio-calidad • S/{bestProduct.quotaMonthly}/mes
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-[#22c55e] text-white cursor-pointer font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all"
                onPress={handleContinueWithBest}
                endContent={<ArrowRight className="w-4 h-4" />}
              >
                Lo quiero
              </Button>
            </div>
          )}

          {/* Toggle for differences */}
          <div className="flex items-center justify-start gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={comparisonState.showOnlyDifferences}
                onChange={(e) => onStateChange({
                  ...comparisonState,
                  showOnlyDifferences: e.target.checked,
                })}
                className="w-4 h-4 rounded border-neutral-300 text-[#4654CD] focus:ring-[#4654CD] cursor-pointer"
              />
              <span className="text-sm text-neutral-600">Solo mostrar diferencias</span>
            </label>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <ComparisonTableV1
              products={products}
              specs={specs}
              showOnlyDifferences={comparisonState.showOnlyDifferences}
              highlightVersion={config.highlightVersion}
              config={config}
            />
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-between">
          <Button
            variant="light"
            startContent={<Trash2 className="w-4 h-4" />}
            onPress={onClearAll}
            className="cursor-pointer text-neutral-600 hover:text-red-500"
          >
            Limpiar comparación
          </Button>
          <div className="flex gap-3">
            <Button
              variant="bordered"
              onPress={onClose}
              className="cursor-pointer border-neutral-200"
            >
              Cerrar
            </Button>
            {!showBestOption ? (
              <Button
                className="bg-[#4654CD] text-white cursor-pointer font-semibold"
                onPress={handleShowBestOption}
                startContent={<Trophy className="w-4 h-4" />}
              >
                Ver mejor opción
              </Button>
            ) : (
              <Button
                className="bg-[#22c55e] text-white cursor-pointer font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all"
                onPress={handleContinueWithBest}
                endContent={<ArrowRight className="w-4 h-4" />}
              >
                Elegir ganador
              </Button>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
