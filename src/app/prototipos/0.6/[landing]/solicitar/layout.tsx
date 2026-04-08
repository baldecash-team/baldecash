'use client';

/**
 * Wizard Preview Layout
 * Wraps wizard pages with providers:
 * - ProductProvider: manages selected product state
 * - WizardConfigProvider: fetches form config from API
 * - WizardProvider: manages form state and persistence
 *
 * Note: SessionProvider and EventTrackerProvider are in the parent
 * [landing] layout. Session is lazy — initialized here when user
 * enters the form flow (not on landing page load).
 */

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { WizardProvider } from './context/WizardContext';
import { WizardConfigProvider } from './context/WizardConfigContext';
import { ProductProvider } from './context/ProductContext';
import { useSession } from './context/SessionContext';

function SessionInitializer({ landing }: { landing: string }) {
  const { initSession, isInitialized, isCreating } = useSession();

  useEffect(() => {
    if (!isInitialized && !isCreating) {
      initSession(landing);
    }
  }, [landing, isInitialized, isCreating, initSession]);

  return null;
}

export default function WizardPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  return (
    <ProductProvider landingSlug={landing}>
      <WizardConfigProvider slug={landing}>
        <SessionInitializer landing={landing} />
        <WizardProvider landingSlug={landing}>{children}</WizardProvider>
      </WizardConfigProvider>
    </ProductProvider>
  );
}
