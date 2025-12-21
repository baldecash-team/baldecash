'use client';

import React from 'react';
import { Card, CardBody, Checkbox, Button } from '@nextui-org/react';
import { Check, Plus } from 'lucide-react';
import { ProductSelectorProps } from '../../../types/comparator';

/**
 * ProductSelectorV1 - Checkbox en Cards
 * E-commerce clásico - checkbox siempre visible
 * Referencia: Amazon, Best Buy
 */
export const ProductSelectorV1: React.FC<ProductSelectorProps> = ({
  products,
  selectedIds,
  onSelect,
  onDeselect,
  maxProducts,
  version,
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => {
        const selected = isSelected(product.id);
        const disabled = !selected && !canSelectMore;

        return (
          <Card
            key={product.id}
            className={`border transition-all cursor-pointer ${
              selected
                ? 'border-[#4654CD] bg-[#4654CD]/5 shadow-md'
                : disabled
                ? 'border-neutral-200 opacity-50'
                : 'border-neutral-200 hover:border-[#4654CD]/50 hover:shadow-sm'
            }`}
            isPressable={!disabled}
            onPress={() => !disabled && handleToggle(product.id)}
          >
            <CardBody className="p-3">
              {/* Checkbox */}
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

              {/* Product Image */}
              <img
                src={product.thumbnail}
                alt={product.displayName}
                className="w-full h-24 object-contain mb-2"
              />

              {/* Product Info */}
              <h4 className="text-sm font-semibold text-neutral-800 line-clamp-2 mb-1">
                {product.displayName}
              </h4>
              <p className="text-lg font-bold text-[#4654CD]">
                S/{product.quotaMonthly}<span className="text-xs font-normal text-neutral-500">/mes</span>
              </p>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};
