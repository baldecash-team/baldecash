'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Grid CSS: grid-cols-[repeat(auto-fill,minmax(min(305px,100%),1fr))]
// Sidebar: 320px on lg+ screens, padding ~48px (p-6 on each side)
const CARD_MIN_WIDTH = 280;
const SIDEBAR_WIDTH = 320;
const GRID_GAP = 24; // gap-6 = 1.5rem = 24px
const LAYOUT_PADDING = 48; // p-6 on each side of main area

/**
 * Calculates how many columns fit based on available width.
 * Matches the CSS: repeat(auto-fill, minmax(min(305px, 100%), 1fr))
 */
function calcColumns(viewportWidth: number): number {
  // On lg+ (>=1024px), sidebar is visible
  const hasSidebar = viewportWidth >= 1024;
  const availableWidth = viewportWidth - (hasSidebar ? SIDEBAR_WIDTH : 0) - LAYOUT_PADDING;

  if (availableWidth <= CARD_MIN_WIDTH) return 1;

  // auto-fill: as many columns of min 305px as fit, accounting for gaps
  // Available = n * 305 + (n-1) * 24 → n * (305 + 24) - 24 ≤ available
  const cols = Math.floor((availableWidth + GRID_GAP) / (CARD_MIN_WIDTH + GRID_GAP));
  return Math.max(1, cols);
}

/**
 * useGridColumns - Detects the number of grid columns dynamically.
 *
 * Uses a two-phase approach:
 * 1. Immediately calculates columns from viewport width (works before render)
 * 2. Once the grid ref is available, reads actual columns from computed style
 *
 * This ensures the initial API fetch uses the correct column count.
 */
export function useGridColumns() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<number>(() => {
    // SSR-safe: calculate from viewport width if available
    if (typeof window !== 'undefined') {
      return calcColumns(window.innerWidth);
    }
    return 3; // SSR default
  });

  const detectFromGrid = useCallback(() => {
    const el = gridRef.current;
    if (!el) return;

    const gridTemplate = getComputedStyle(el).gridTemplateColumns;
    if (gridTemplate && gridTemplate !== 'none') {
      const cols = gridTemplate.split(' ').filter(v => v !== '').length;
      if (cols > 0) {
        setColumns(cols);
      }
    }
  }, []);

  useEffect(() => {
    // Recalculate on resize using viewport-based calculation (always available)
    const handleResize = () => {
      // Prefer actual grid measurement when grid has content
      const el = gridRef.current;
      if (el && el.children.length > 0) {
        detectFromGrid();
      } else {
        setColumns(calcColumns(window.innerWidth));
      }
    };

    window.addEventListener('resize', handleResize);

    // Also observe the grid element for changes (e.g., when products load)
    const el = gridRef.current;
    let observer: ResizeObserver | null = null;
    if (el) {
      observer = new ResizeObserver(() => {
        if (el.children.length > 0) {
          detectFromGrid();
        }
      });
      observer.observe(el);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer?.disconnect();
    };
  }, [detectFromGrid]);

  return { gridRef, columns };
}

/**
 * Rounds a number UP to the nearest multiple of columns.
 * e.g. roundToColumns(15, 4) = 16, roundToColumns(15, 3) = 15
 */
export function roundToColumns(count: number, columns: number): number {
  if (columns <= 1) return count;
  return Math.ceil(count / columns) * columns;
}
