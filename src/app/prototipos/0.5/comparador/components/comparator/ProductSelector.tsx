'use client';

import React from 'react';
import { Card, CardBody, Checkbox, Button } from '@nextui-org/react';
import { Check, Scale } from 'lucide-react';
import { ProductSelectorProps, ComparisonProduct } from '../../types/comparator';

/**
 * ProductSelector - Grid de productos seleccionables
 * Permite seleccionar productos para comparar
 */
export const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  selectedIds,
  onSelect,
  onDeselect,
  maxProducts,
}) => {
  const handleToggle = (product: ComparisonProduct) => {
    if (selectedIds.includes(product.id)) {
      onDeselect(product.id);
    } else if (selectedIds.length < maxProducts) {
      onSelect(product.id);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {products.map((product) => {
        const isSelected = selectedIds.includes(product.id);
        const isDisabled = !isSelected && selectedIds.length >= maxProducts;
        const selectionOrder = selectedIds.indexOf(product.id) + 1;

        return (
          <Card
            key={product.id}
            isPressable
            isDisabled={isDisabled}
            onPress={() => handleToggle(product)}
            className={`transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'border-2 border-[#4654CD] bg-[#4654CD]/5 shadow-md'
                : isDisabled
                ? 'opacity-50 cursor-not-allowed'
                : 'border border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-sm'
            }`}
          >
            <CardBody className="p-3 relative">
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#4654CD] text-white text-xs font-bold flex items-center justify-center">
                  {selectionOrder}
                </div>
              )}

              {/* Checkbox */}
              <div className="absolute top-2 right-2">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[#4654CD] border-[#4654CD]'
                      : 'bg-white border-neutral-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>

              {/* Product info */}
              <div className="pt-6 text-center">
                <img
                  src={product.thumbnail}
                  alt={product.displayName}
                  className="w-full h-24 object-contain mb-2"
                />
                <p className="text-xs text-neutral-500">{product.brand}</p>
                <p className="text-sm font-semibold text-neutral-800 line-clamp-2 mb-2 min-h-[40px]">
                  {product.displayName}
                </p>
                <p className="text-base font-bold text-[#4654CD]">
                  S/{product.quotaMonthly}
                  <span className="text-xs font-normal text-neutral-500">/mes</span>
                </p>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};

/**
 * CompareFloatingBar - Barra flotante para iniciar comparación
 */
interface CompareFloatingBarProps {
  selectedProducts: ComparisonProduct[];
  onCompare: () => void;
  onClear: () => void;
  maxProducts: number;
}

export const CompareFloatingBar: React.FC<CompareFloatingBarProps> = ({
  selectedProducts,
  onCompare,
  onClear,
  maxProducts,
}) => {
  if (selectedProducts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-xl border border-neutral-200 p-3 flex items-center gap-4">
      {/* Product thumbnails */}
      <div className="flex -space-x-2">
        {selectedProducts.map((product) => (
          <div
            key={product.id}
            className="w-10 h-10 rounded-lg border-2 border-white bg-neutral-100 overflow-hidden shadow-sm"
          >
            <img
              src={product.thumbnail}
              alt={product.displayName}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
        {selectedProducts.length < maxProducts && (
          <div className="w-10 h-10 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center">
            <span className="text-neutral-400 text-lg">+</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-sm">
        <p className="font-medium text-neutral-800">
          {selectedProducts.length} de {maxProducts} equipos
        </p>
        <p className="text-xs text-neutral-500">
          {selectedProducts.length >= 2 ? 'Listo para comparar' : 'Selecciona al menos 2'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="light"
          onPress={onClear}
          className="cursor-pointer text-neutral-500"
        >
          Limpiar
        </Button>
        <Button
          size="sm"
          isDisabled={selectedProducts.length < 2}
          className="bg-[#4654CD] text-white cursor-pointer font-semibold disabled:opacity-50"
          onPress={onCompare}
          startContent={<Scale className="w-4 h-4" />}
        >
          Comparar
        </Button>
      </div>
    </div>
  );
};
