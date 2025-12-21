'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { X, Trash2, Scale } from 'lucide-react';
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
  const specs = compareSpecs(products);

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
          {/* Products Header Row */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden mb-6">
            <div className="grid" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
              {/* Empty corner cell */}
              <div className="p-4 border-b border-r border-neutral-200 bg-neutral-50" />

              {/* Product headers */}
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className={`p-4 border-b border-neutral-200 ${
                    index < products.length - 1 ? 'border-r' : ''
                  }`}
                >
                  <div className="relative">
                    <button
                      onClick={() => onRemoveProduct(product.id)}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-neutral-100 hover:bg-red-100 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <X className="w-3 h-3 text-neutral-500 hover:text-red-500" />
                    </button>
                    <img
                      src={product.thumbnail}
                      alt={product.displayName}
                      className="w-24 h-24 object-contain mx-auto mb-3"
                    />
                    <h3 className="text-sm font-semibold text-neutral-800 text-center line-clamp-2 mb-2">
                      {product.displayName}
                    </h3>
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#4654CD]">
                        S/{product.quotaMonthly}<span className="text-sm font-normal text-neutral-500">/mes</span>
                      </p>
                      <p className="text-xs text-neutral-400">
                        Total: S/{product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            <ComparisonTableV1
              products={products}
              specs={specs}
              showOnlyDifferences={comparisonState.showOnlyDifferences}
              highlightVersion={config.highlightVersion}
              config={config}
            />
          </div>

          {/* Toggle for differences */}
          <div className="flex items-center justify-center gap-4">
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
            <Button
              className="bg-[#4654CD] text-white cursor-pointer"
              onPress={() => {
                // TODO: Navigate to most affordable product
                console.log('Selecting best option');
              }}
            >
              Ver mejor opción
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
