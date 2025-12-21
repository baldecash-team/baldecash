'use client';

import React from 'react';
import { Crown, Cpu, MemoryStick, HardDrive, Monitor, DollarSign } from 'lucide-react';
import { ComparisonTableProps } from '../../../types/comparator';

/**
 * ComparisonTableV6 - Specs Gigantes
 * Only 5 key specs shown (processor, ram, storage, display, price)
 * Very large typography
 * Winner centered and prominent
 */
export const ComparisonTableV6: React.FC<ComparisonTableProps> = ({
  products,
  specs,
  showOnlyDifferences,
  highlightVersion,
  config,
}) => {
  // Only show key specs
  const keySpecKeys = ['processor', 'ram', 'storage', 'displaySize', 'price'];
  const keySpecs = specs.filter(spec => keySpecKeys.includes(spec.key));

  // Get icon for each spec
  const getSpecIcon = (key: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      processor: <Cpu className="w-8 h-8" />,
      ram: <MemoryStick className="w-8 h-8" />,
      storage: <HardDrive className="w-8 h-8" />,
      displaySize: <Monitor className="w-8 h-8" />,
      price: <DollarSign className="w-8 h-8" />,
    };
    return iconMap[key] || null;
  };

  // Calculate overall winner
  const winCounts = products.map((_, index) =>
    keySpecs.filter(spec => spec.winner === index).length
  );
  const overallWinnerIndex = winCounts.indexOf(Math.max(...winCounts));

  const isColumnWinner = (index: number): boolean => {
    return index === overallWinnerIndex;
  };

  if (keySpecs.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-500">
        <p>No hay especificaciones clave para comparar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {/* Products header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}>
        <div className="flex items-center justify-center">
          <span className="text-lg font-bold text-neutral-700">Producto</span>
        </div>
        {products.map((product, index) => (
          <div
            key={product.id}
            className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl transition-all ${
              isColumnWinner(index)
                ? 'bg-gradient-to-br from-[#4654CD] to-[#3644b3] text-white shadow-xl scale-105'
                : 'bg-neutral-100 text-neutral-800'
            }`}
          >
            {isColumnWinner(index) && (
              <Crown className="w-8 h-8 text-yellow-300 fill-yellow-300 animate-pulse" />
            )}
            <h3 className="text-xl font-bold text-center leading-tight">
              {product.displayName}
            </h3>
            {isColumnWinner(index) && (
              <span className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full">
                Mejor opción
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Key specs */}
      {keySpecs.map((spec) => (
        <div
          key={spec.key}
          className="grid gap-4 items-center"
          style={{ gridTemplateColumns: `200px repeat(${products.length}, 1fr)` }}
        >
          {/* Spec label with icon */}
          <div className="flex items-center gap-4 p-4">
            <div className="text-[#4654CD]">
              {getSpecIcon(spec.key)}
            </div>
            <div>
              <h4 className="text-lg font-bold text-neutral-800">{spec.label}</h4>
              {spec.isDifferent && (
                <span className="text-xs text-neutral-500">Valores diferentes</span>
              )}
            </div>
          </div>

          {/* Values */}
          {products.map((product, index) => (
            <div
              key={`${product.id}-${spec.key}`}
              className={`p-6 rounded-2xl text-center transition-all cursor-pointer hover:scale-105 ${
                spec.winner === index && spec.isDifferent
                  ? 'bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white shadow-lg'
                  : isColumnWinner(index)
                  ? 'bg-[#4654CD]/10 border-2 border-[#4654CD]'
                  : 'bg-neutral-100'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className={`text-3xl font-black ${
                  spec.winner === index && spec.isDifferent
                    ? 'text-white'
                    : 'text-neutral-800'
                }`}>
                  {spec.values[index]}
                </span>
                {spec.winner === index && spec.isDifferent && (
                  <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">
                    Mejor
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Winner summary */}
      {overallWinnerIndex >= 0 && (
        <div className="mt-8 p-8 bg-gradient-to-r from-[#4654CD] to-[#3644b3] text-white rounded-3xl shadow-2xl">
          <div className="flex items-center justify-center gap-4">
            <Crown className="w-10 h-10 text-yellow-300 fill-yellow-300" />
            <div>
              <p className="text-sm font-medium opacity-90">Ganador General</p>
              <h3 className="text-3xl font-black">{products[overallWinnerIndex].displayName}</h3>
            </div>
            <div className="ml-auto text-right">
              <p className="text-4xl font-black">{winCounts[overallWinnerIndex]}/5</p>
              <p className="text-sm opacity-90">Ventajas</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
