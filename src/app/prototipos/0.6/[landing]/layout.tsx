'use client';

/**
 * Landing Layout
 * Provides shared layout data (navbar, footer, company) to all pages under [landing]
 */

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { LayoutProvider } from './context/LayoutContext';

/**
 * Persists ?keepData=true from URL to sessionStorage.
 * Used for testing: prevents form/product cleanup after submit.
 */
function useKeepDataFlag() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const value = searchParams.get('keepData');
    if (value === 'true') {
      sessionStorage.setItem('keepData', 'true');
    } else if (value === 'false') {
      sessionStorage.removeItem('keepData');
    }
  }, [searchParams]);
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useKeepDataFlag();

  return (
    <LayoutProvider>
      {children}
    </LayoutProvider>
  );
}
