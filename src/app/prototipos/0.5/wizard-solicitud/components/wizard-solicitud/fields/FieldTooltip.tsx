'use client';

/**
 * FieldTooltip - Custom tooltip for mobile compatibility
 * Works on both desktop (hover) and mobile (tap)
 * - Desktop: hover to show/hide
 * - Mobile: tap to toggle, tap outside to close
 */

import React, { useState, useRef, useEffect } from 'react';
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
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect touch device on mount
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Small delay to prevent the same tap that opened it from closing it
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleClick = (e: React.MouseEvent) => {
    if (isTouchDevice) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-flex">
      <span
        className="inline-flex cursor-help"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Info className="w-4 h-4 text-neutral-400 hover:text-[#4654CD] transition-colors" />
      </span>

      {isOpen && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 max-w-xs p-3 bg-white rounded-lg shadow-lg border border-neutral-200">
          {/* Arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-[-1px] w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-neutral-200 -z-10" />

          <p className="font-semibold text-neutral-800 text-sm">{tooltip.title}</p>
          <p className="text-xs text-neutral-500 mt-1">{tooltip.description}</p>
          {tooltip.recommendation && (
            <p className="text-xs text-[#4654CD] mt-2 flex items-center gap-1">
              <Info className="w-3 h-3 flex-shrink-0" />
              {tooltip.recommendation}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FieldTooltip;
