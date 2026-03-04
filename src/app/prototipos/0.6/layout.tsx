'use client';

/**
 * Prototipos 0.6 Layout
 * Provides PreviewProvider to all pages under /prototipos/0.6/
 * This enables preview mode to persist across navigation
 */

import { PreviewProvider } from './context/PreviewContext';

export default function Prototipos06Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PreviewProvider>
      {children}
    </PreviewProvider>
  );
}
