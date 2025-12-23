'use client';

import React from 'react';
import { Trophy, Crown, Check, X as XIcon, TrendingDown, Zap, ArrowLeftRight } from 'lucide-react';
import { ComparisonTableProps, ComparableSpec, calculatePriceDifference } from '../../../types/comparator';

/**
 * ComparisonTableV1 - Tabla de Comparación
 * Soporta múltiples versiones de:
 * - highlightVersion: Cómo mostrar mejor/peor
 * - priceDiffVersion: Cómo mostrar diferencia de precio
 * - fieldsVersion: Qué campos mostrar
 * - differenceHighlightVersion: Cómo resaltar diferencias
 */
export const ComparisonTableV1: React.FC<ComparisonTableProps> = ({
  products,
  specs,
  showOnlyDifferences,
  highlightVersion,
  config,
  showProductHeaders = true,
}) => {
  const diffVersion = config?.differenceHighlightVersion || 1;
  const hlVersion = config?.highlightVersion || 1;
  const priceVersion = config?.priceDiffVersion || 1;
  const fieldsVer = config?.fieldsVersion || 1;

  // Calculate price differences
  const priceDiff = calculatePriceDifference(products);

  // Filter specs based on fieldsVersion
  const getFieldsForVersion = () => {
    switch (fieldsVer) {
      case 1: // Specs Principales
        return ['processor', 'ram', 'storage', 'displaySize', 'quota'];
      case 2: // Specs + Features
        return ['processor', 'ram', 'storage', 'displaySize', 'resolution', 'gpu', 'quota', 'price'];
      case 3: // Completo
        return null; // Show all
      case 4: // Animado (all with animation)
        return null;
      case 5: // Split Layout
        return null;
      case 6: // 5 Campos Impacto
        return ['processor', 'ram', 'storage', 'quota', 'price'];
      default:
        return null;
    }
  };

  const allowedFields = getFieldsForVersion();

  const shouldFilterDifferences = showOnlyDifferences;

  let filteredSpecs = shouldFilterDifferences
    ? specs.filter(s => s.isDifferent)
    : specs;

  // Filter by allowed fields
  if (allowedFields) {
    filteredSpecs = filteredSpecs.filter(s => allowedFields.includes(s.key));
  }

  // Get winner style based on highlightVersion
  const getWinnerStyle = (spec: ComparableSpec, index: number) => {
    if (!spec.isDifferent) return '';

    const isWinner = spec.winner === index;
    const isWorst = spec.higherIsBetter
      ? spec.rawValues[index] === Math.min(...spec.rawValues)
      : spec.rawValues[index] === Math.max(...spec.rawValues);
    const isOnlyWorst = isWorst && spec.rawValues.filter(v => v === spec.rawValues[index]).length === 1;

    switch (hlVersion) {
      case 1: // Semántico Clásico - Verde/Rojo
        if (isWinner) return 'bg-[#22c55e]/10 text-[#22c55e]';
        if (isOnlyWorst) return 'bg-red-50 text-red-600';
        return '';

      case 2: // Iconos - solo estilos sutiles
        if (isWinner) return 'bg-amber-50';
        return '';

      case 3: // Barras Proporcionales
        if (isWinner) return 'bg-[#4654CD]/5';
        return '';

      case 4: // Gradientes Fintech
        if (isWinner) return 'bg-gradient-to-r from-[#22c55e]/10 to-transparent';
        if (isOnlyWorst) return 'bg-gradient-to-r from-red-100/50 to-transparent';
        return '';

      case 5: // Columna Resaltada
        if (isWinner) return 'bg-[#4654CD]/5 border-l-2 border-[#4654CD]';
        return '';

      case 6: // Ganador Centrado
        if (isWinner) return 'bg-[#22c55e]/10 font-bold text-lg';
        return 'opacity-60';

      default:
        return '';
    }
  };

  // Get winner icon based on highlightVersion
  const getWinnerIcon = (spec: ComparableSpec, index: number) => {
    if (!spec.isDifferent || spec.winner !== index) return null;

    switch (hlVersion) {
      case 1: // Semántico Clásico
        return <Trophy className="w-4 h-4 text-[#22c55e]" />;
      case 2: // Iconos
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 3: // Barras Proporcionales
        return <Check className="w-4 h-4 text-[#4654CD]" />;
      case 4: // Gradientes Fintech
        return <Zap className="w-4 h-4 text-[#22c55e]" />;
      case 5: // Columna Resaltada
        return <Check className="w-4 h-4 text-[#4654CD]" />;
      case 6: // Ganador Centrado
        return <Trophy className="w-5 h-5 text-[#22c55e]" />;
      default:
        return <Trophy className="w-4 h-4 text-[#22c55e]" />;
    }
  };

  // Get difference highlight style (row background)
  // V1: Punto Amarillo - sin fondo, solo punto
  // V2: Barra Lateral - sin fondo, barra en td separado
  // V3: Badge "≠" - sin fondo, badge en label
  // V4: Fondo Gradiente - gradiente amarillo a transparente
  // V5: Subrayado Animado - sin fondo, borde inferior animado
  // V6: Icono Comparación - sin fondo, icono en label
  const getDifferenceStyle = (spec: ComparableSpec) => {
    if (!spec.isDifferent) return '';

    switch (diffVersion) {
      case 4: // Fondo Gradiente
        return 'bg-gradient-to-r from-amber-100/60 to-transparent';
      case 5: // Subrayado Animado
        return 'border-b-2 border-amber-400 animate-pulse';
      default:
        return '';
    }
  };

  // Get row difference indicator (reserved for future use)
  const getRowDifferenceIndicator = (_spec: ComparableSpec) => {
    return null;
  };

  // Get difference label indicator (punto, etiqueta, badge, o icono)
  const getDifferenceLabelIndicator = (spec: ComparableSpec) => {
    if (!spec.isDifferent) return null;

    switch (diffVersion) {
      case 1: // Punto Amarillo
        return <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="Diferente" />;
      case 2: // Etiqueta "Diferente"
        return (
          <span className="px-2 py-0.5 text-[10px] font-medium text-[#4654CD] bg-[#4654CD]/10 rounded-full uppercase tracking-wide">
            Diferente
          </span>
        );
      case 3: // Badge "≠"
        return (
          <span className="px-1.5 py-0.5 text-xs font-semibold text-[#4654CD] bg-[#4654CD]/10 rounded-md">
            ≠
          </span>
        );
      case 6: // Icono Comparación
        return <ArrowLeftRight className="w-4 h-4 text-amber-500 flex-shrink-0" />;
      default:
        return null;
    }
  };

  // Render price diff based on priceDiffVersion
  const renderPriceDiff = (index: number) => {
    const diff = priceDiff.quota[index];
    if (diff === 0) return null;

    switch (priceVersion) {
      case 1: // Diferencia Relativa
        return (
          <span className="text-xs text-red-500 ml-1">+S/{diff}</span>
        );
      case 2: // Cuota Prominente
        return (
          <div className="text-sm font-bold text-red-500 mt-1">+S/{diff}/mes</div>
        );
      case 3: // Ahorro Anual
        return (
          <div className="text-xs text-red-500 mt-1">+S/{diff * 12}/año</div>
        );
      case 4: // Badge Animado
        return (
          <span className="inline-block ml-1 px-1.5 py-0.5 text-xs font-medium text-red-500 bg-red-50 rounded-full animate-pulse">
            +S/{diff}
          </span>
        );
      case 5: // Panel Lateral - subtle
        return (
          <span className="text-xs text-neutral-400 ml-1">(+{diff})</span>
        );
      case 6: // Diferencia Gigante
        return (
          <div className="text-lg font-black text-red-500 mt-1">+S/{diff}</div>
        );
      default:
        return null;
    }
  };

  if (filteredSpecs.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-500">
        <p>No hay diferencias entre los productos seleccionados.</p>
      </div>
    );
  }

  // Calculate equal width for product columns
  const productColumnWidth = products.length > 0 ? `${(100 - 25) / products.length}%` : 'auto';

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        {/* Header con productos */}
        {showProductHeaders && (
          <thead>
            <tr className="border-b-2 border-neutral-200">
              <th className="p-4 text-left font-semibold text-neutral-600 border-r border-neutral-200 w-[200px]">
                Comparación Detallada
              </th>
              {products.map((product, index) => {
                const isCheapest = priceDiff.quota[index] === 0;
                return (
                  <th
                    key={product.id}
                    style={{ width: productColumnWidth }}
                    className={`p-4 text-center ${index < products.length - 1 ? 'border-r border-neutral-100' : ''} ${
                      hlVersion === 5 && isCheapest ? 'bg-[#4654CD]/5' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {/* Cheapest badge based on priceVersion */}
                      {isCheapest && priceVersion !== 5 && (
                        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          priceVersion === 6 ? 'bg-[#22c55e] text-white text-sm py-1' : 'bg-[#22c55e]/10 text-[#22c55e]'
                        }`}>
                          <TrendingDown className="w-3 h-3" />
                          <span>{priceVersion === 6 ? 'MÁS BARATO' : 'Mejor precio'}</span>
                        </div>
                      )}
                      <div className="w-16 h-16 bg-white rounded-lg border border-neutral-100 flex items-center justify-center p-2">
                        <img
                          src={product.thumbnail}
                          alt={product.displayName}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-neutral-500">{product.brand}</p>
                        <p className="text-sm font-semibold text-neutral-800 line-clamp-2 max-w-[120px]">
                          {product.displayName}
                        </p>
                        <div className="mt-1">
                          <span className={`font-bold text-[#4654CD] ${priceVersion === 6 ? 'text-xl' : 'text-sm'}`}>
                            S/{product.quotaMonthly}
                          </span>
                          <span className="text-xs font-normal text-neutral-500">/mes</span>
                        </div>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
        )}
        <tbody>
          {filteredSpecs.map((spec, specIndex) => (
            <tr
              key={spec.key}
              className={`${specIndex % 2 === 0 ? 'bg-white' : 'bg-neutral-50'} ${getDifferenceStyle(spec)} border-b border-neutral-100 last:border-b-0 ${
                fieldsVer === 4 ? 'animate-fadeIn' : ''
              }`}
              style={fieldsVer === 4 ? { animationDelay: `${specIndex * 100}ms` } : undefined}
            >
              {getRowDifferenceIndicator(spec)}

              {/* Spec label */}
              <td className="p-4 font-medium text-neutral-700 border-r border-neutral-200 w-[200px]">
                <div className="flex items-center gap-2">
                  <span>{spec.label}</span>
                  {getDifferenceLabelIndicator(spec)}
                </div>
              </td>

              {/* Product values */}
              {products.map((product, index) => (
                <td
                  key={`${product.id}-${spec.key}`}
                  className={`p-4 text-center transition-colors ${
                    getWinnerStyle(spec, index)
                  } ${index < products.length - 1 ? 'border-r border-neutral-100' : ''}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {/* V3: Barras Proporcionales */}
                    {hlVersion === 3 && spec.isDifferent && (
                      <div className="w-full max-w-[80px] h-2 bg-neutral-200 rounded-full overflow-hidden mr-2">
                        <div
                          className="h-full bg-[#4654CD] rounded-full"
                          style={{
                            width: `${(spec.rawValues[index] / Math.max(...spec.rawValues)) * 100}%`
                          }}
                        />
                      </div>
                    )}
                    <span className={`font-medium ${fieldsVer === 6 ? 'text-lg' : ''}`}>
                      {spec.values[index]}
                    </span>
                    {getWinnerIcon(spec, index)}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Price Summary based on priceVersion */}
      {priceVersion === 3 && priceDiff.annualSaving > 0 && (
        <div className="mt-4 p-4 bg-[#22c55e]/10 rounded-lg text-center">
          <p className="text-sm text-neutral-600">Ahorro anual eligiendo el más económico:</p>
          <p className="text-2xl font-bold text-[#22c55e]">S/{priceDiff.annualSaving}</p>
        </div>
      )}
    </div>
  );
};
