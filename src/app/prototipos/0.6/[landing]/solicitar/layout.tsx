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
import { EventTrackerProvider } from './context/EventTrackerContext';

export default function WizardPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const landing = (params.landing as string) || 'home';

  return (
    <ProductProvider landingSlug={landing}>
      <SessionProvider landingSlug={landing}>
        <EventTrackerProvider>
          <WizardConfigProvider slug={landing}>
            <WizardProvider landingSlug={landing}>{children}</WizardProvider>
          </WizardConfigProvider>
        </EventTrackerProvider>
      </SessionProvider>
    </ProductProvider>
  );
}
