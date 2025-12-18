'use client';

/**
 * FilterSection - Seccion colapsable de filtros
 *
 * Wrapper para agrupar filtros con titulo y tooltip explicativo
 * Expandido por defecto para filtros principales
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Tooltip } from '@nextui-org/react';
import { FilterTooltipContent } from '../../../types/catalog';

interface FilterSectionProps {
  title: string;
  tooltip?: FilterTooltipContent;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  tooltip,
  defaultExpanded = true,
  children,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-neutral-200 py-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-neutral-800 font-['Asap']">{title}</h3>
          {tooltip && (
            <Tooltip
              content={
                <div className="max-w-xs p-2">
                  <p className="font-semibold text-sm">{tooltip.title}</p>
                  <p className="text-xs text-neutral-600 mt-1">{tooltip.description}</p>
                  {tooltip.recommendation && (
                    <p className="text-xs text-[#4654CD] mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      {tooltip.recommendation}
                    </p>
                  )}
                </div>
              }
              classNames={{
                content: 'bg-white shadow-lg border border-neutral-200',
              }}
            >
              <span className="cursor-help">
                <Info className="w-4 h-4 text-neutral-400 hover:text-[#4654CD] transition-colors" />
              </span>
            </Tooltip>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-neutral-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-500" />
        )}
      </button>

      {expanded && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
};

export default FilterSection;
