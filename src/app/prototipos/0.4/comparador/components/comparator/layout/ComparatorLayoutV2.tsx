'use client';

import React, { useState } from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { ArrowLeft, X, Trash2, Scale, Filter } from 'lucide-react';
import { ComparatorLayoutProps } from '../../../types/comparator';
import { ComparisonTableV1 } from '../table/ComparisonTableV1';
import { compareSpecs } from '../../../types/comparator';

/**
 * ComparatorLayoutV2 - Página Dedicada
 * Full page layout (not modal), diseño tipo página de comparación dedicada
 * Referencia: Apple, Samsung comparison pages
 *
 * Características:
 * - Header con botón de regreso y título
 * - Productos en columnas con botones de eliminar
 * - Tabla de comparación debajo
 * - Header sticky opcional
 * - Acciones prominentes en footer
 */
export const ComparatorLayoutV2: React.FC<ComparatorLayoutProps & { onBack: () => void }> = ({
  products,
  config,
  onRemoveProduct,
  onClearAll,
  comparisonState,
  onStateChange,
  onBack,
}) => {
  const [stickyHeader, setStickyHeader] = useState(true);
  const specs = compareSpecs(products);

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-neutral-200 flex items-center justify-center mx-auto mb-6">
            <Scale className="w-10 h-10 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-700 mb-3 font-['Baloo_2']">
            No hay equipos para comparar
          </h2>
          <p className="text-neutral-500 mb-6">
            Selecciona al menos 2 equipos desde el catálogo
          </p>
          <Button
            onPress={onBack}
            className="bg-[#4654CD] text-white cursor-pointer"
            startContent={<ArrowLeft className="w-4 h-4" />}
          >
            Volver al catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header
        className={`bg-white border-b border-neutral-200 ${
          stickyHeader ? 'sticky top-0 z-40' : ''
        } transition-shadow ${stickyHeader ? 'shadow-sm' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4">
              <Button
                isIconOnly
                variant="light"
                onPress={onBack}
                className="cursor-pointer hover:bg-neutral-100"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-700" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4654CD]/10 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-[#4654CD]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 font-['Baloo_2']">
                    Comparador de Equipos
                  </h1>
                  <p className="text-sm text-neutral-500">
                    {products.length} equipos seleccionados
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Clear all button */}
            <Button
              variant="light"
              startContent={<Trash2 className="w-4 h-4" />}
              onPress={onClearAll}
              className="cursor-pointer text-neutral-600 hover:text-red-500"
            >
              <span className="hidden sm:inline">Limpiar comparación</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardBody className="p-6">
                {/* Remove button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => onRemoveProduct(product.id)}
                    className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-red-100 flex items-center justify-center cursor-pointer transition-colors group"
                  >
                    <X className="w-4 h-4 text-neutral-500 group-hover:text-red-500" />
                  </button>
                </div>

                {/* Product Image */}
                <div className="aspect-square bg-white rounded-lg mb-4 flex items-center justify-center p-4">
                  <img
                    src={product.thumbnail}
                    alt={product.displayName}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-neutral-800 line-clamp-2 min-h-[3.5rem]">
                    {product.displayName}
                  </h3>

                  {/* Key specs */}
                  <div className="space-y-1 text-sm text-neutral-600">
                    <p className="flex items-center gap-2">
                      <span className="text-neutral-400">Procesador:</span>
                      <span className="font-medium">{product.specs.processor.model}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-neutral-400">RAM:</span>
                      <span className="font-medium">{product.specs.ram.size}GB</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-neutral-400">Almacenamiento:</span>
                      <span className="font-medium">
                        {product.specs.storage.size}GB {product.specs.storage.type.toUpperCase()}
                      </span>
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="pt-3 border-t border-neutral-200">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold text-[#4654CD]">
                        S/{product.quotaMonthly}
                      </span>
                      <span className="text-sm text-neutral-500">/mes</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Total: S/{product.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Comparison Table Section */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-800 font-['Baloo_2']">
                Comparación Detallada
              </h2>

              {/* Filter toggle */}
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
                <span className="text-sm text-neutral-600 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Solo mostrar diferencias
                </span>
              </label>
            </div>
          </div>

          {/* Table Content */}
          <div className="p-6">
            <ComparisonTableV1
              products={products}
              specs={specs}
              showOnlyDifferences={comparisonState.showOnlyDifferences}
              highlightVersion={config.highlightVersion}
              config={config}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-xl border border-neutral-200">
          <div className="text-center sm:text-left">
            <p className="text-sm text-neutral-600">
              ¿Ya decidiste cuál es el mejor para ti?
            </p>
            <p className="text-xs text-neutral-400">
              Haz clic en "Ver mejor opción" para conocer el equipo más económico
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="bordered"
              onPress={onBack}
              className="cursor-pointer border-neutral-200"
            >
              Volver al catálogo
            </Button>
            <Button
              className="bg-[#4654CD] text-white cursor-pointer"
              onPress={() => {
                // TODO: Navigate to most affordable product
                const cheapest = products.reduce((min, p) =>
                  p.quotaMonthly < min.quotaMonthly ? p : min
                );
                console.log('Best option:', cheapest);
              }}
            >
              Ver mejor opción
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
