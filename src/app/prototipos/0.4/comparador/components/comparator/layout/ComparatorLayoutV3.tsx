'use client';

import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { X, Trash2, Scale, ChevronRight, Eye } from 'lucide-react';
import { ComparatorLayoutProps } from '../../../types/comparator';
import { ComparisonTableV1 } from '../table/ComparisonTableV1';
import { compareSpecs } from '../../../types/comparator';

/**
 * ComparatorLayoutV3 - Panel Sticky
 * Split layout: catálogo a la izquierda, panel sticky comparador a la derecha
 * Referencia: Airbnb, Booking sidebar filters
 *
 * Características:
 * - Layout dividido 60/40 o 70/30
 * - Panel derecho sticky que permanece visible al hacer scroll
 * - Product cards compactas en el panel
 * - Botón para ver comparación completa
 * - Catálogo renderizado por el padre (children)
 */
export const ComparatorLayoutV3: React.FC<
  ComparatorLayoutProps & {
    children?: React.ReactNode;
    onViewFullComparison?: () => void;
  }
> = ({
  products,
  config,
  onRemoveProduct,
  onClearAll,
  comparisonState,
  onStateChange,
  children,
  onViewFullComparison,
}) => {
  const specs = compareSpecs(products);
  const hasProducts = products.length > 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex gap-6 p-6">
          {/* Left side: Catalog content */}
          <div className={`flex-1 ${hasProducts ? 'lg:w-[65%]' : 'w-full'}`}>
            {children}
          </div>

          {/* Right side: Sticky Comparator Panel */}
          {hasProducts && (
            <div className="hidden lg:block lg:w-[35%] xl:w-[30%]">
              <div className="sticky top-6 space-y-4">
                {/* Header Card */}
                <Card className="border border-neutral-200 shadow-sm">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                          <Scale className="w-5 h-5 text-[#4654CD]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-neutral-800 font-['Baloo_2']">
                            Comparador
                          </h3>
                          <p className="text-xs text-neutral-500">
                            {products.length} equipos
                          </p>
                        </div>
                      </div>
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={onClearAll}
                        className="cursor-pointer text-neutral-500 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-neutral-50 rounded-lg p-2">
                        <p className="text-xs text-neutral-500">Desde</p>
                        <p className="text-sm font-bold text-[#4654CD]">
                          S/{Math.min(...products.map(p => p.quotaMonthly))}/mes
                        </p>
                      </div>
                      <div className="bg-neutral-50 rounded-lg p-2">
                        <p className="text-xs text-neutral-500">Hasta</p>
                        <p className="text-sm font-bold text-neutral-700">
                          S/{Math.max(...products.map(p => p.quotaMonthly))}/mes
                        </p>
                      </div>
                    </div>

                    {/* View Full Comparison Button */}
                    <Button
                      className="w-full bg-[#4654CD] text-white cursor-pointer"
                      endContent={<Eye className="w-4 h-4" />}
                      onPress={onViewFullComparison}
                    >
                      Ver comparación completa
                    </Button>
                  </CardBody>
                </Card>

                {/* Products List */}
                <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto">
                  {products.map((product, index) => (
                    <Card
                      key={product.id}
                      className="border border-neutral-200 hover:border-[#4654CD]/50 transition-all cursor-pointer group"
                    >
                      <CardBody className="p-4">
                        <div className="flex gap-3">
                          {/* Product Image */}
                          <div className="w-20 h-20 bg-white rounded-lg flex-shrink-0 flex items-center justify-center p-2 border border-neutral-100">
                            <img
                              src={product.thumbnail}
                              alt={product.displayName}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="text-sm font-semibold text-neutral-800 line-clamp-2 leading-tight">
                                {product.displayName}
                              </h4>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveProduct(product.id);
                                }}
                                className="w-6 h-6 rounded-full bg-neutral-100 hover:bg-red-100 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors group/btn"
                              >
                                <X className="w-3 h-3 text-neutral-500 group-hover/btn:text-red-500" />
                              </button>
                            </div>

                            {/* Compact specs */}
                            <div className="space-y-1 text-xs text-neutral-600 mb-2">
                              <p className="truncate">
                                {product.specs.processor.model} • {product.specs.ram.size}GB RAM
                              </p>
                              <p className="truncate">
                                {product.specs.storage.size}GB {product.specs.storage.type.toUpperCase()}
                              </p>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold text-[#4654CD]">
                                S/{product.quotaMonthly}
                              </span>
                              <span className="text-xs text-neutral-500">/mes</span>
                            </div>
                          </div>
                        </div>

                        {/* Position indicator */}
                        <div className="mt-3 pt-3 border-t border-neutral-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-neutral-400">
                              Equipo {index + 1} de {products.length}
                            </span>
                            <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:text-[#4654CD] transition-colors" />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>

                {/* Quick Comparison Preview */}
                {products.length >= 2 && (
                  <Card className="border border-neutral-200 shadow-sm">
                    <CardBody className="p-4">
                      <h4 className="text-sm font-bold text-neutral-800 mb-3 font-['Baloo_2']">
                        Vista Rápida
                      </h4>
                      <div className="space-y-2">
                        {/* RAM Comparison */}
                        <div className="text-xs">
                          <p className="text-neutral-500 mb-1">Memoria RAM</p>
                          <div className="flex items-center gap-2">
                            {products.map((p, i) => (
                              <div
                                key={p.id}
                                className={`flex-1 h-2 rounded-full ${
                                  p.specs.ram.size === Math.max(...products.map(p => p.specs.ram.size))
                                    ? 'bg-[#4654CD]'
                                    : 'bg-neutral-200'
                                }`}
                                title={`${p.specs.ram.size}GB`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Storage Comparison */}
                        <div className="text-xs">
                          <p className="text-neutral-500 mb-1">Almacenamiento</p>
                          <div className="flex items-center gap-2">
                            {products.map((p, i) => (
                              <div
                                key={p.id}
                                className={`flex-1 h-2 rounded-full ${
                                  p.specs.storage.size === Math.max(...products.map(p => p.specs.storage.size))
                                    ? 'bg-[#03DBD0]'
                                    : 'bg-neutral-200'
                                }`}
                                title={`${p.specs.storage.size}GB`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Price Comparison */}
                        <div className="text-xs">
                          <p className="text-neutral-500 mb-1">Precio (mejor = menor)</p>
                          <div className="flex items-center gap-2">
                            {products.map((p, i) => (
                              <div
                                key={p.id}
                                className={`flex-1 h-2 rounded-full ${
                                  p.quotaMonthly === Math.min(...products.map(p => p.quotaMonthly))
                                    ? 'bg-green-500'
                                    : 'bg-neutral-200'
                                }`}
                                title={`S/${p.quotaMonthly}/mes`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Show differences toggle */}
                <Card className="border border-neutral-200">
                  <CardBody className="p-3">
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
                      <span className="text-xs text-neutral-600">
                        Solo mostrar diferencias
                      </span>
                    </label>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
