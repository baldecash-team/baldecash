/**
 * Empty State Preview v0.6 - Server Component Wrapper
 */

import EmptyPreviewClient from './EmptyPreviewClient';

export default function EmptyStatePreviewPage() {
  return <EmptyPreviewClient />;
}

// Generar rutas estáticas para output: export
export async function generateStaticParams() {
  const knownLandings = [
    'home',
    'laptops-estudiantes',
    'celulares-2026',
    'motos-lima',
  ];

  return knownLandings.map((landing) => ({ landing }));
}
