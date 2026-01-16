'use client';

/**
 * FieldTooltip - Controlled tooltip for mobile compatibility
 * Wrapper around NextUI Tooltip that works on touch devices
 */

import React, { useState, useRef, useEffect } from 'react';
import { Tooltip } from '@nextui-org/react';
import { Info } from 'lucide-react';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

interface FieldTooltipProps {
  tooltip: FieldTooltipInfo;
}

export const FieldTooltip: React.FC<FieldTooltipProps> = ({ tooltip }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <Tooltip
      isOpen={isOpen}
      onOpenChange={setIsOpen}
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
      <span
        ref={tooltipRef}
        className="inline-flex"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <Info className="w-4 h-4 text-neutral-400 hover:text-[#4654CD] cursor-help transition-colors" />
      </span>
    </Tooltip>
  );
};

export default FieldTooltip;
