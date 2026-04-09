/**
 * Catálogo v0.6 - Server Component Wrapper
 * Renderiza el cliente y genera rutas estáticas para output: export
 */

import { CatalogoClient } from './CatalogoClient';
import { GamerCatalogoClient } from './GamerCatalogoClient';
import { getLandingMeta } from '../../services/landingApi';

export default async function CatalogoPage({
  params,
}: {
  params: Promise<{ landing: string }>;
}) {
  const resolvedParams = await params;
  const landing = resolvedParams.landing || 'home';

  if (landing === 'zona-gamer') {
    return <GamerCatalogoClient />;
  }

  return <CatalogoClient />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}

// Metadata dinámica desde API
export async function generateMetadata({
  params,
}: {
  params: Promise<{ landing: string }>;
}) {
  const resolvedParams = await params;
  const landing = resolvedParams.landing || 'home';

  // Obtener metadatos desde el API
  const meta = await getLandingMeta(landing);

  // Construir título: "Catálogo - [nombre landing]" o usar meta_title si existe
  const landingName = meta?.name || landing;
  const title = meta?.meta_title
    ? `Catálogo | ${meta.meta_title}`
    : `Catálogo - BaldeCash ${landing === 'home' ? '' : `| ${landingName}`}`;

  return {
    title,
    description: meta?.meta_description || 'Explora nuestro catálogo de laptops para estudiantes.',
  };
}
