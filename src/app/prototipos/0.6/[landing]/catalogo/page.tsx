/**
 * Catálogo v0.6 - Server Component Wrapper
 * Renderiza el cliente y genera rutas estáticas para output: export
 */

import { CatalogoClient } from './CatalogoClient';
import { getLandingMeta } from '../../services/landingApi';

export default function CatalogoPage() {
  return <CatalogoClient />;
}

// Generar rutas estáticas para output: export
export async function generateStaticParams() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'https://ws2-production-0f0e.up.railway.app/api/v1';

  let slugs = ['home'];

  try {
    const response = await fetch(`${apiUrl}/public/landing/list/slugs`, {
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.slugs && Array.isArray(data.slugs)) {
        slugs = data.slugs;
      }
    }
  } catch {
    console.log('[catalogo/generateStaticParams] Using fallback (API unavailable)');
  }

  return slugs.map((landing) => ({ landing }));
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
