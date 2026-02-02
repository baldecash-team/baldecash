/**
 * Catálogo v0.6 - Server Component Wrapper
 * Renderiza el cliente y genera rutas estáticas para output: export
 */

import { CatalogoClient } from './CatalogoClient';

export default function CatalogoPage() {
  return <CatalogoClient />;
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

// Metadata estática
export async function generateMetadata({
  params,
}: {
  params: Promise<{ landing: string }>;
}) {
  const resolvedParams = await params;
  const landing = resolvedParams.landing || 'home';

  return {
    title: `Catálogo - BaldeCash ${landing === 'home' ? '' : `| ${landing}`}`,
    description: 'Explora nuestro catálogo de laptops para estudiantes.',
  };
}
