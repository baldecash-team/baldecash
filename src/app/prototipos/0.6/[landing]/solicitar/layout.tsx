'use client';

/**
 * Wizard Preview Layout
 * Wraps all wizard pages with providers:
 * - ProductProvider: manages selected product state
 * - WizardConfigProvider: fetches form config from API
 * - WizardProvider: manages form state and persistence
 * - SessionProvider: manages tracking session for analytics and submission
 */

import { useParams } from 'next/navigation';
import { WizardProvider } from './context/WizardContext';
import { WizardConfigProvider } from './context/WizardConfigContext';
import { ProductProvider } from './context/ProductContext';
import { SessionProvider } from './context/SessionContext';

export default function WizardPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  return (
    <ProductProvider>
      <SessionProvider landingSlug={landing}>
        <WizardConfigProvider slug={landing}>
          <WizardProvider landingSlug={landing}>{children}</WizardProvider>
        </WizardConfigProvider>
      </SessionProvider>
    </ProductProvider>
  );
}
