'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FieldTooltip } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/fields';
import { FilterTooltipInfo } from '../../../types/catalog';

interface FilterSectionProps {
  title: string;
  tooltip?: FilterTooltipInfo;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  count?: number;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  tooltip,
  defaultExpanded = true,
  children,
  count,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-neutral-200 py-4 bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-neutral-800 group-hover:text-[#4654CD] transition-colors">
            {title}
          </h3>
          {count !== undefined && count > 0 && (
            <span className="text-xs text-neutral-400">({count})</span>
          )}
          {tooltip && (
            <FieldTooltip
              content={{
                title: tooltip.title,
                description: tooltip.description,
                recommendation: tooltip.recommendation,
              }}
            />
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-neutral-400 group-hover:text-[#4654CD] transition-colors" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-400 group-hover:text-[#4654CD] transition-colors" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};
