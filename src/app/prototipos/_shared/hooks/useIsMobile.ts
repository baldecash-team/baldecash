'use client';

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Hook para detectar si el dispositivo es mobile
 * Usa el breakpoint de Tailwind md (768px)
 *
 * @returns boolean - true si el ancho es menor a 768px
 */
export function useIsMobile(): boolean {
  // Default to false (desktop) for SSR
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Check on mount
    checkIsMobile();

    // Listen for resize
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

export default useIsMobile;
