'use client';

/**
 * Landing Layout
 * Provides shared layout data (navbar, footer, company) to all pages under [landing]
 * Also wraps with SessionProvider + EventTrackerProvider so behavioral tracking
 * starts from the first page the user visits (home, catálogo, producto, etc.)
 */

import { Suspense, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { LayoutProvider } from './context/LayoutContext';
import { SessionProvider } from './solicitar/context/SessionContext';
import { EventTrackerProvider } from './solicitar/context/EventTrackerContext';

/**
 * Persists ?keepData=true from URL to sessionStorage.
 * Used for testing: prevents form/product cleanup after submit.
 */
function KeepDataFlag() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const value = searchParams.get('keepData');
    if (value === 'true') {
      sessionStorage.setItem('keepData', 'true');
    } else if (value === 'false') {
      sessionStorage.removeItem('keepData');
    }
  }, [searchParams]);
  return null;
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  return (
    <LayoutProvider>
      <SessionProvider landingSlug={landing}>
        <EventTrackerProvider>
          <Suspense>
            <KeepDataFlag />
          </Suspense>
          {children}
        </EventTrackerProvider>
      </SessionProvider>
    </LayoutProvider>
  );
}
