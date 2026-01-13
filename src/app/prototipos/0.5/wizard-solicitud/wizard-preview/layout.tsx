'use client';

/**
 * Wizard Preview Layout
 * Wraps all wizard pages with the form state provider
 * Note: ProductProvider is at the 0.5 layout level
 */

import { WizardProvider } from '../context/WizardContext';

export default function WizardPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WizardProvider>{children}</WizardProvider>;
}
