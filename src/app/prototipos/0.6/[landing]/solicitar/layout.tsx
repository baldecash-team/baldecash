'use client';

/**
 * Wizard Preview Layout
 * Wraps wizard pages with providers:
 * - ProductProvider: manages selected product state
 * - WizardConfigProvider: fetches form config from API
 * - WizardProvider: manages form state and persistence
 *
 * Note: SessionProvider and EventTrackerProvider are now in the parent
 * [landing] layout so tracking starts from the first page visited.
 */

import { useParams } from 'next/navigation';
import { WizardProvider } from './context/WizardContext';
import { WizardConfigProvider } from './context/WizardConfigContext';
import { ProductProvider } from './context/ProductContext';

export default function WizardPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  // TODO: Quitar cuando zona-gamer tenga su propia config en el backend
  const wizardSlug = landing === 'zona-gamer' ? 'home' : landing;

  return (
    <ProductProvider landingSlug={landing}>
      <WizardConfigProvider slug={wizardSlug}>
        <WizardProvider landingSlug={landing}>{children}</WizardProvider>
      </WizardConfigProvider>
    </ProductProvider>
  );
}
