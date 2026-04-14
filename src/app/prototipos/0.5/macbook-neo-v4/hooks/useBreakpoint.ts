'use client';

import { useEffect, useState } from 'react';
import type { Breakpoint } from '../types/v4Types';
import { BREAKPOINTS } from '../lib/constants';

function getBreakpoint(width: number): Breakpoint {
  if (width <= BREAKPOINTS.xsmall) return 'xsmall';
  if (width <= BREAKPOINTS.small) return 'small';
  if (width <= BREAKPOINTS.medium) return 'medium';
  if (width <= BREAKPOINTS.large) return 'large';
  return 'xlarge';
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>('large');

  useEffect(() => {
    const update = () => setBp(getBreakpoint(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return bp;
}
