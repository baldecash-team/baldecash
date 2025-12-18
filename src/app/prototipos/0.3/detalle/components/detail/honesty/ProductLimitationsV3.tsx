'use client';

/**
 * ProductLimitationsV3 - Tooltips en Specs Afectados
 *
 * Caracteristicas:
 * - No tiene UI propia
 * - Exporta tooltips para usar en specs
 * - Integracion contextual
 * - Ideal para: UI limpia, info contextual
 */

import React from 'react';
import { Tooltip, Chip } from '@nextui-org/react';
import { AlertCircle, Info, AlertTriangle, Lightbulb } from 'lucide-react';
import { ProductLimitationsProps, ProductLimitation } from '../../../types/detail';

interface LimitationTooltipProps {
  limitation: ProductLimitation;
  children: React.ReactNode;
}

export const LimitationTooltip: React.FC<LimitationTooltipProps> = ({
  limitation,
  children,
}) => {
  return (
    <Tooltip
      content={
        <div className="max-w-xs p-2">
          <div className="flex items-center gap-2 mb-2">
            {limitation.severity === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <Info className="w-4 h-4 text-blue-400" />
            )}
            <span className="font-medium text-white">{limitation.category}</span>
          </div>
          <p className="text-neutral-200 text-sm mb-2">{limitation.description}</p>
          {limitation.alternative && (
            <div className="flex items-start gap-1.5 p-2 bg-white/10 rounded">
              <Lightbulb className="w-3.5 h-3.5 text-[#03DBD0] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-neutral-200">{limitation.alternative}</p>
            </div>
          )}
        </div>
      }
      classNames={{
        content: 'bg-neutral-800 rounded-lg shadow-xl',
      }}
    >
      {children}
    </Tooltip>
  );
};

// Componente que muestra un resumen minimalista
export const ProductLimitationsV3: React.FC<ProductLimitationsProps> = ({ limitations }) => {
  if (limitations.length === 0) return null;

  const warningCount = limitations.filter((l) => l.severity === 'warning').length;
  const infoCount = limitations.filter((l) => l.severity === 'info').length;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Indicador minimalista */}
      <Tooltip
        content={
          <div className="p-2 max-w-sm">
            <p className="font-medium text-white mb-2">Aspectos a considerar</p>
            <ul className="space-y-1">
              {limitations.map((l, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  {l.severity === 'warning' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-neutral-200">{l.description}</span>
                </li>
              ))}
            </ul>
          </div>
        }
        classNames={{
          content: 'bg-neutral-800 rounded-lg shadow-xl',
        }}
      >
        <button className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer">
          <Info className="w-4 h-4 text-neutral-500" />
          <span className="text-sm text-neutral-600">
            {limitations.length} {limitations.length === 1 ? 'nota' : 'notas'}
          </span>
          {warningCount > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          )}
        </button>
      </Tooltip>

      {/* Chips individuales para warnings */}
      {limitations
        .filter((l) => l.severity === 'warning')
        .map((limitation, index) => (
          <LimitationTooltip key={index} limitation={limitation}>
            <button className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full transition-colors hover:bg-amber-100 cursor-pointer">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-700">
                {limitation.category}
              </span>
            </button>
          </LimitationTooltip>
        ))}
    </div>
  );
};

// Export helper para encontrar limitaciones por categoria
export const findLimitationByCategory = (
  limitations: ProductLimitation[],
  category: string
): ProductLimitation | undefined => {
  return limitations.find(
    (l) => l.category.toLowerCase() === category.toLowerCase()
  );
};

// Export hook para usar limitaciones en specs
export const useLimitationsForSpecs = (limitations: ProductLimitation[]) => {
  const getTooltipForSpec = (specCategory: string) => {
    const limitation = findLimitationByCategory(limitations, specCategory);
    if (!limitation) return null;

    return {
      content: limitation.description,
      alternative: limitation.alternative,
      severity: limitation.severity,
    };
  };

  return { getTooltipForSpec };
};

export default ProductLimitationsV3;
