'use client';

/**
 * Wizard Preview Layout
 * Wraps all wizard pages with providers:
 * - ProductProvider: manages selected product state
 * - WizardConfigProvider: fetches form config from API
 * - WizardProvider: manages form state and persistence
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

  return (
    <ProductProvider>
      <WizardConfigProvider slug={landing}>
        <WizardProvider>{children}</WizardProvider>
      </WizardConfigProvider>
    </ProductProvider>
  );
}
