'use client';

/**
 * SimilarProductsV3 - Panel Lateral "Compara con..."
 *
 * Caracteristicas:
 * - Lista compacta lado a lado
 * - Comparacion directa de specs
 * - Formato tabla
 * - Ideal para: desktop, comparacion detallada
 */

import React, { useState } from 'react';
import { Button, Chip, RadioGroup, Radio } from '@nextui-org/react';
import { ArrowRight, Check, ChevronRight, Scale, X } from 'lucide-react';
import { SimilarProductsProps } from '../../../types/detail';
import { formatCurrency } from '../../../data/mockDetailData';

export const SimilarProductsV3: React.FC<SimilarProductsProps> = ({
  products,
  currentProductId,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(
    products.find((p) => p.id !== currentProductId)?.id || null
  );

  const filteredProducts = products.filter((p) => p.id !== currentProductId);
  const selected = filteredProducts.find((p) => p.id === selectedProduct);

  // Mock current product specs for comparison
  const currentProductSpecs = {
    price: 2499,
    lowestQuota: 89,
    processor: 'Ryzen 5',
    ram: '8GB',
    storage: '256GB SSD',
    display: '15.6" FHD',
  };

  // Mock selected product specs
  const getSelectedSpecs = () => {
    if (!selected) return null;
    // Simular specs basados en el producto
    return {
      price: selected.price,
      lowestQuota: selected.lowestQuota,
      processor: selected.differentiators.find((d) => d.includes('Intel')) ? 'Intel i5' : 'Ryzen 3',
      ram: '8GB',
      storage: selected.differentiators.find((d) => d.includes('economica')) ? '256GB SSD' : '512GB SSD',
      display: selected.differentiators.find((d) => d.includes('IPS')) ? '15.6" IPS' : '15.6" TN',
    };
  };

  const selectedSpecs = getSelectedSpecs();

  const compareSpec = (current: string | number, other: string | number) => {
    if (typeof current === 'number' && typeof other === 'number') {
      return current < other ? 'better' : current > other ? 'worse' : 'equal';
    }
    // Para strings, comparar si son iguales
    return current === other ? 'equal' : 'different';
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-100 bg-neutral-50">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-[#4654CD]" />
          <h3 className="font-semibold text-neutral-800">Compara con otros</h3>
        </div>
      </div>

      {/* Product selector */}
      <div className="p-4 border-b border-neutral-100">
        <p className="text-sm text-neutral-500 mb-3">Selecciona para comparar:</p>
        <div className="space-y-2">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                selectedProduct === product.id
                  ? 'bg-[#4654CD]/5 border border-[#4654CD]/30'
                  : 'bg-neutral-50 border border-transparent hover:border-neutral-200'
              }`}
            >
              <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="w-full h-full object-contain p-1"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-neutral-800 text-sm line-clamp-1">
                  {product.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatCurrency(product.lowestQuota)}/mes
                </p>
              </div>
              <Chip
                size="sm"
                radius="sm"
                classNames={{
                  base: `h-5 px-1.5 ${
                    product.matchScore >= 90 ? 'bg-[#22c55e]' : 'bg-[#4654CD]'
                  }`,
                  content: 'text-white text-xs px-0',
                }}
              >
                {product.matchScore}%
              </Chip>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison table */}
      {selected && selectedSpecs && (
        <div className="divide-y divide-neutral-100">
          {/* Table header */}
          <div className="grid grid-cols-3 bg-neutral-50 text-xs font-semibold text-neutral-500 uppercase">
            <div className="p-3">Spec</div>
            <div className="p-3 text-center border-x border-neutral-100 bg-[#4654CD]/5 text-[#4654CD]">
              Este producto
            </div>
            <div className="p-3 text-center">{selected.name.split(' ')[0]}</div>
          </div>

          {/* Price row */}
          <div className="grid grid-cols-3 text-sm">
            <div className="p-3 text-neutral-600">Precio</div>
            <div className="p-3 text-center border-x border-neutral-100 font-medium">
              {formatCurrency(currentProductSpecs.price)}
            </div>
            <div className="p-3 text-center font-medium">
              {formatCurrency(selectedSpecs.price)}
              {selectedSpecs.price < currentProductSpecs.price && (
                <span className="ml-1 text-xs text-[#22c55e]">Menor</span>
              )}
            </div>
          </div>

          {/* Cuota row */}
          <div className="grid grid-cols-3 text-sm">
            <div className="p-3 text-neutral-600">Cuota</div>
            <div className="p-3 text-center border-x border-neutral-100 font-bold text-[#4654CD]">
              {formatCurrency(currentProductSpecs.lowestQuota)}/mes
            </div>
            <div className="p-3 text-center font-medium">
              {formatCurrency(selectedSpecs.lowestQuota)}/mes
            </div>
          </div>

          {/* Processor row */}
          <div className="grid grid-cols-3 text-sm">
            <div className="p-3 text-neutral-600">Procesador</div>
            <div className="p-3 text-center border-x border-neutral-100 font-medium">
              {currentProductSpecs.processor}
            </div>
            <div className="p-3 text-center font-medium">
              {selectedSpecs.processor}
            </div>
          </div>

          {/* RAM row */}
          <div className="grid grid-cols-3 text-sm">
            <div className="p-3 text-neutral-600">RAM</div>
            <div className="p-3 text-center border-x border-neutral-100 font-medium">
              {currentProductSpecs.ram}
            </div>
            <div className="p-3 text-center font-medium">{selectedSpecs.ram}</div>
          </div>

          {/* Storage row */}
          <div className="grid grid-cols-3 text-sm">
            <div className="p-3 text-neutral-600">SSD</div>
            <div className="p-3 text-center border-x border-neutral-100 font-medium">
              {currentProductSpecs.storage}
            </div>
            <div className="p-3 text-center font-medium">{selectedSpecs.storage}</div>
          </div>

          {/* Display row */}
          <div className="grid grid-cols-3 text-sm">
            <div className="p-3 text-neutral-600">Pantalla</div>
            <div className="p-3 text-center border-x border-neutral-100 font-medium">
              {currentProductSpecs.display}
            </div>
            <div className="p-3 text-center font-medium">{selectedSpecs.display}</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex gap-2">
        <Button
          variant="flat"
          className="flex-1 bg-[#4654CD]/10 text-[#4654CD] font-medium cursor-pointer"
          endContent={<ArrowRight className="w-4 h-4" />}
        >
          Ver detalle
        </Button>
        <Button
          variant="flat"
          className="flex-1 bg-neutral-200 text-neutral-700 font-medium cursor-pointer"
        >
          Comparar mas
        </Button>
      </div>
    </div>
  );
};

export default SimilarProductsV3;
