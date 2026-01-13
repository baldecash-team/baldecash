'use client';

/**
 * Layout v0.5
 * Wraps all v0.5 pages with shared providers
 */

import { ProductProvider } from './wizard-solicitud/context/ProductContext';

export default function Layout05({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProductProvider>{children}</ProductProvider>;
}
