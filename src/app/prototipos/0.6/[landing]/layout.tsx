'use client';

/**
 * Landing Layout
 * Provides shared layout data (navbar, footer, company) to all pages under [landing]
 */

import { LayoutProvider } from './context/LayoutContext';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutProvider>
      {children}
    </LayoutProvider>
  );
}
