'use client';

/**
 * Wizard Preview Layout
 * Wraps all wizard pages with the form state provider
 */

import { WizardProvider } from '../context/WizardContext';
import { ProductProvider } from '../context/ProductContext';

export default function WizardPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProductProvider>
      <WizardProvider>{children}</WizardProvider>
    </ProductProvider>
  );
}
