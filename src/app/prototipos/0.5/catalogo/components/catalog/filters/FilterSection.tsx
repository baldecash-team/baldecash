'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Tooltip } from '@nextui-org/react';
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
            <Tooltip
              content={
                <div className="max-w-xs p-2">
                  <p className="font-semibold text-neutral-800">{tooltip.title}</p>
                  <p className="text-xs text-neutral-500 mt-1">{tooltip.description}</p>
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
              <span className="inline-flex">
                <Info className="w-4 h-4 text-neutral-400 hover:text-[#4654CD] cursor-help transition-colors" />
              </span>
            </Tooltip>
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
