'use client';

/**
 * FieldTooltip - Custom tooltip for mobile compatibility
 * Works on both desktop (hover) and mobile (tap)
 * - Desktop: hover to show/hide
 * - Mobile: tap to toggle, tap outside to close
 * - Dynamic positioning to avoid viewport edges
 * - Uses Portal to render outside overflow containers
 *
 * Supports multiple content formats:
 * - string: Simple text tooltip
 * - ReactNode: Custom content
 * - FieldTooltipInfo: Structured { title, description, recommendation? }
 */

import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

export interface FieldTooltipInfo {
  title: string;
  description: string;
  recommendation?: string;
}

export type TooltipContent = string | ReactNode | FieldTooltipInfo;

interface FieldTooltipProps {
  tooltip?: FieldTooltipInfo;
  content?: TooltipContent;
  icon?: ReactNode;
}

// Type guard to check if content is FieldTooltipInfo
const isFieldTooltipInfo = (content: TooltipContent): content is FieldTooltipInfo => {
  return typeof content === 'object' && content !== null && 'title' in content && 'description' in content;
};

type HorizontalAlign = 'left' | 'center' | 'right';

interface TooltipPosition {
  top: number;
  left: number;
  arrowLeft: number;
}

const TOOLTIP_WIDTH = 256; // w-64 = 256px
const VIEWPORT_PADDING = 16; // Minimum distance from viewport edge
const TOOLTIP_OFFSET = 8; // Distance from trigger

export const FieldTooltip: React.FC<FieldTooltipProps> = ({ tooltip, content, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0, arrowLeft: 0 });
  const [alignment, setAlignment] = useState<HorizontalAlign>('center');
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Resolve content - prefer 'content' prop, fallback to 'tooltip' for backwards compatibility
  const resolvedContent = content ?? tooltip;

  // Check if mounted (for Portal)
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

    // Calculate tooltip left position
    let tooltipLeft: number;
    let arrowLeft: number;
    let newAlignment: HorizontalAlign;

    // Calculate where tooltip edges would be if centered
    const tooltipLeftIfCentered = iconCenterX - TOOLTIP_WIDTH / 2;
    const tooltipRightIfCentered = iconCenterX + TOOLTIP_WIDTH / 2;

    // Check if tooltip would overflow
    if (tooltipLeftIfCentered < VIEWPORT_PADDING) {
      // Too close to left edge - align left
      tooltipLeft = VIEWPORT_PADDING;
      arrowLeft = iconCenterX - VIEWPORT_PADDING;
      newAlignment = 'left';
    } else if (tooltipRightIfCentered > viewportWidth - VIEWPORT_PADDING) {
      // Too close to right edge - align right
      tooltipLeft = viewportWidth - VIEWPORT_PADDING - TOOLTIP_WIDTH;
      arrowLeft = iconCenterX - tooltipLeft;
      newAlignment = 'right';
    } else {
      // Enough space - center it
      tooltipLeft = iconCenterX - TOOLTIP_WIDTH / 2;
      arrowLeft = TOOLTIP_WIDTH / 2;
      newAlignment = 'center';
    }

    // Calculate top position (above the trigger)
    const tooltipTop = rect.top - TOOLTIP_OFFSET;

    setPosition({
      top: tooltipTop,
      left: tooltipLeft,
      arrowLeft: arrowLeft,
    });
    setAlignment(newAlignment);
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
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(target)
      ) {
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

  // Render tooltip content based on type
  const renderContent = () => {
    if (!resolvedContent) return null;

    // String content
    if (typeof resolvedContent === 'string') {
      return <p className="text-sm text-neutral-700">{resolvedContent}</p>;
    }

    // FieldTooltipInfo content
    if (isFieldTooltipInfo(resolvedContent)) {
      return (
        <>
          <p className="font-semibold text-neutral-800 text-sm">{resolvedContent.title}</p>
          <p className="text-xs text-neutral-500 mt-1">{resolvedContent.description}</p>
          {resolvedContent.recommendation && (
            <p className="text-xs text-[var(--color-primary)] mt-2 flex items-center gap-1">
              <Info className="w-3 h-3 flex-shrink-0" />
              {resolvedContent.recommendation}
            </p>
          )}
        </>
      );
    }

    // ReactNode content (custom)
    return resolvedContent;
  };

  if (!resolvedContent) return null;

  // Render tooltip in portal
  const tooltipElement = isOpen && isMounted ? createPortal(
    <div
      ref={tooltipRef}
      className="fixed z-[9999] w-64 p-3 bg-white rounded-lg shadow-lg border border-neutral-200"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateY(-100%)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Arrow */}
      <div
        className="absolute top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"
        style={{ left: position.arrowLeft - 8 }}
      />
      <div
        className="absolute top-full mt-[-1px] w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-neutral-200 -z-10"
        style={{ left: position.arrowLeft - 8 }}
      />

      {renderContent()}
    </div>,
    document.body
  ) : null;

  return (
    <div ref={containerRef} className="relative inline-flex">
      <span
        className="inline-flex cursor-help"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {icon ?? <Info className="w-4 h-4 text-neutral-400 hover:text-[var(--color-primary)] transition-colors" />}
      </span>

      {tooltipElement}
    </div>
  );
};

export default FieldTooltip;
