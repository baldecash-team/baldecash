'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MacbookNeoColor } from '../types/v4Types';
import { getPdpImageUrl } from '../lib/constants';

interface UseProductViewerOptions {
  defaultColor?: MacbookNeoColor;
  positions?: number;
}

/**
 * Interactive product viewer state: drag/swipe rotation, color selection, image preloading.
 */
export function useProductViewer(opts: UseProductViewerOptions = {}) {
  const { defaultColor = 'silver', positions = 10 } = opts;

  const [activeColor, setActiveColor] = useState<MacbookNeoColor>(defaultColor);
  const [activePosition, setActivePosition] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartPos = useRef(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const preloadedRef = useRef<Set<string>>(new Set());

  // Preload all positions for a color
  const preloadColor = useCallback(
    (color: MacbookNeoColor) => {
      if (preloadedRef.current.has(color)) return;
      preloadedRef.current.add(color);
      for (let i = 1; i <= positions; i++) {
        const img = new Image();
        img.src = getPdpImageUrl(color, i);
      }
    },
    [positions],
  );

  // Preload default color on mount
  useEffect(() => {
    preloadColor(defaultColor);
  }, [defaultColor, preloadColor]);

  const setColor = useCallback(
    (color: MacbookNeoColor) => {
      setActiveColor(color);
      setActivePosition(1);
      preloadColor(color);
    },
    [preloadColor],
  );

  const nextPosition = useCallback(() => {
    setActivePosition((p) => (p % positions) + 1);
  }, [positions]);

  const prevPosition = useCallback(() => {
    setActivePosition((p) => (p <= 1 ? positions : p - 1));
  }, [positions]);

  // Pointer/touch handlers for drag rotation
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartPos.current = activePosition;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [activePosition]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX.current;
      const steps = Math.floor(deltaX / 40); // 40px per position step
      let newPos = dragStartPos.current + steps;
      // Wrap around
      newPos = ((newPos - 1) % positions + positions) % positions + 1;
      setActivePosition(newPos);
    },
    [isDragging, positions],
  );

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const currentImageUrl = getPdpImageUrl(activeColor, activePosition);

  return {
    activeColor,
    activePosition,
    isDragging,
    currentImageUrl,
    containerRef,
    setColor,
    nextPosition,
    prevPosition,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
