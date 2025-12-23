'use client';

import React from 'react';
import { Card, CardBody, Checkbox } from '@nextui-org/react';
import { Check } from 'lucide-react';
import { ProductSelectorProps } from '../../../types/comparator';

/**
 * ProductSelectorV1 - Selector de productos para comparación
 * Checkbox clásico en cards - estilo e-commerce
 */
export const ProductSelectorV1: React.FC<ProductSelectorProps> = ({
  products,
  selectedIds,
  onSelect,
  onDeselect,
  maxProducts,
  cardSelectionVersion = 1,
}) => {
  const isSelected = (id: string) => selectedIds.includes(id);
  const canSelectMore = selectedIds.length < maxProducts;

  const handleToggle = (productId: string) => {
    if (isSelected(productId)) {
      onDeselect(productId);
    } else if (canSelectMore) {
      onSelect(productId);
    }
  };

  // V1: Borde + Fondo (e-commerce clásico)
  const getCardStyleV1 = (selected: boolean, disabled: boolean) => {
    if (selected) {
      return 'border-[#4654CD] bg-[#4654CD]/5 shadow-md';
    }
    if (disabled) {
      return 'border-neutral-200 opacity-50';
    }
    return 'border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-sm';
  };

  // V2: Badge esquina + Borde prominente
  const getCardStyleV2 = (selected: boolean, disabled: boolean) => {
    if (selected) {
      return 'border-2 border-[#4654CD] shadow-lg';
    }
    if (disabled) {
      return 'border-neutral-200 opacity-50';
    }
    return 'border-neutral-200 hover:border-[#4654CD]/40 hover:shadow-md';
  };

  // V3: Glow + Ribbon (fintech)
  const getCardStyleV3 = (selected: boolean, disabled: boolean) => {
    if (selected) {
      return 'border-[#4654CD] shadow-[0_0_20px_rgba(70,84,205,0.3)]';
    }
    if (disabled) {
      return 'border-neutral-200 opacity-50';
    }
    return 'border-neutral-200 hover:border-[#4654CD]/30 hover:shadow-sm';
  };

  const getCardStyle = (selected: boolean, disabled: boolean) => {
    switch (cardSelectionVersion) {
      case 2:
        return getCardStyleV2(selected, disabled);
      case 3:
        return getCardStyleV3(selected, disabled);
      default:
        return getCardStyleV1(selected, disabled);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => {
        const selected = isSelected(product.id);
        const disabled = !selected && !canSelectMore;

        return (
          <Card
            key={product.id}
            className={`border transition-all cursor-pointer relative overflow-hidden ${getCardStyle(selected, disabled)}`}
            isPressable={!disabled}
            onPress={() => !disabled && handleToggle(product.id)}
          >
            <CardBody className="p-3">
              {/* V1: Checkbox + Badge */}
              {cardSelectionVersion === 1 && (
                <div className="flex justify-between items-start mb-2">
                  <Checkbox
                    isSelected={selected}
                    isDisabled={disabled}
                    onChange={() => handleToggle(product.id)}
                    classNames={{
                      base: 'cursor-pointer',
                      wrapper: 'before:border-2 before:border-neutral-300 after:bg-[#4654CD] group-data-[selected=true]:after:bg-[#4654CD]',
                      icon: 'text-white',
                    }}
                  />
                  {selected && (
                    <span className="text-xs font-medium text-[#4654CD] bg-[#4654CD]/10 px-2 py-0.5 rounded-full">
                      Comparando
                    </span>
                  )}
                </div>
              )}

              {/* V2: Badge con número de orden */}
              {cardSelectionVersion === 2 && (
                <div className="flex justify-end items-start mb-2 h-6">
                  {selected && (
                    <div className="flex items-center gap-1.5 bg-[#4654CD] text-white text-xs font-semibold px-2 py-1 rounded-full">
                      <Check className="w-3 h-3" strokeWidth={3} />
                      <span>#{selectedIds.indexOf(product.id) + 1}</span>
                    </div>
                  )}
                </div>
              )}

              {/* V3: Solo espacio (el ribbon se muestra abajo) */}
              {cardSelectionVersion === 3 && (
                <div className="h-6 mb-2" />
              )}

              {/* Product Image */}
              <div className="relative">
                <img
                  src={product.thumbnail}
                  alt={product.displayName}
                  className="w-full h-24 object-contain mb-2"
                />

                {/* Card style V2: Indicador sutil en esquina inferior */}
                {cardSelectionVersion === 2 && selected && (
                  <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center shadow-md">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <h4 className="text-sm font-semibold text-neutral-800 line-clamp-2 mb-1">
                {product.displayName}
              </h4>
              <p className="text-lg font-bold text-[#4654CD]">
                S/{product.quotaMonthly}<span className="text-xs font-normal text-neutral-500">/mes</span>
              </p>
            </CardBody>

            {/* Card style V3: Ribbon diagonal */}
            {cardSelectionVersion === 3 && selected && (
              <div className="absolute -right-8 top-4 rotate-45 bg-[#4654CD] text-white text-xs font-semibold py-1 px-8 shadow-md">
                Comparar
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};
