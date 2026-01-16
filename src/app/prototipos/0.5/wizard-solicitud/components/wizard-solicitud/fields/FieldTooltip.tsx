'use client';

/**
 * FieldTooltip - Custom tooltip for mobile compatibility
 * Works on both desktop (hover) and mobile (tap)
 * - Desktop: hover to show/hide
 * - Mobile: tap to toggle, tap outside to close
 * - Dynamic positioning to avoid viewport edges
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Info } from 'lucide-react';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

interface FieldTooltipProps {
  tooltip: FieldTooltipInfo;
}

type HorizontalAlign = 'left' | 'center' | 'right';

const TOOLTIP_WIDTH = 256; // w-64 = 256px
const VIEWPORT_PADDING = 16; // Minimum distance from viewport edge

export const FieldTooltip: React.FC<FieldTooltipProps> = ({ tooltip }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [alignment, setAlignment] = useState<HorizontalAlign>('center');
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Detect touch device on mount
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Calculate optimal position when tooltip opens
  const calculatePosition = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const iconCenterX = rect.left + rect.width / 2;
    const viewportWidth = window.innerWidth;

    // Calculate where tooltip edges would be if centered
    const tooltipLeftIfCentered = iconCenterX - TOOLTIP_WIDTH / 2;
    const tooltipRightIfCentered = iconCenterX + TOOLTIP_WIDTH / 2;

    // Check if tooltip would overflow
    if (tooltipLeftIfCentered < VIEWPORT_PADDING) {
      // Too close to left edge - align left
      setAlignment('left');
    } else if (tooltipRightIfCentered > viewportWidth - VIEWPORT_PADDING) {
      // Too close to right edge - align right
      setAlignment('right');
    } else {
      // Enough space - center it
      setAlignment('center');
    }
  }, []);

  // Recalculate position when opening
  useEffect(() => {
    if (isOpen) {
      calculatePosition();
    }
  }, [isOpen, calculatePosition]);

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

  // Get tooltip position classes based on alignment
  const getTooltipPositionClasses = () => {
    switch (alignment) {
      case 'left':
        return 'left-0';
      case 'right':
        return 'right-0';
      case 'center':
      default:
        return 'left-1/2 -translate-x-1/2';
    }
  };

  // Get arrow position classes based on alignment
  const getArrowPositionClasses = () => {
    switch (alignment) {
      case 'left':
        return 'left-3';
      case 'right':
        return 'right-3';
      case 'center':
      default:
        return 'left-1/2 -translate-x-1/2';
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
        <div
          ref={tooltipRef}
          className={`absolute z-50 bottom-full mb-2 w-64 p-3 bg-white rounded-lg shadow-lg border border-neutral-200 ${getTooltipPositionClasses()}`}
        >
          {/* Arrow */}
          <div className={`absolute top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white ${getArrowPositionClasses()}`} />
          <div className={`absolute top-full mt-[-1px] w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-neutral-200 -z-10 ${getArrowPositionClasses()}`} />

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
