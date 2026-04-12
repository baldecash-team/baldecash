/**
 * Landing Page - BaldeCash v0.6
 * Ruta dinámica que carga datos desde el backend API (client-side fetch)
 *
 * Rutas:
 * - /prototipos/0.6/ → slug = "home" (default)
 * - /prototipos/0.6/home → slug = "home"
 * - /prototipos/0.6/laptops-estudiantes → slug = "laptops-estudiantes"
 */

import { notFound } from 'next/navigation';
import { LandingPageClient } from './LandingPageClient';
import { getLandingMeta, fetchHeroData, getActiveLandingSlugs } from '../services/landingApi';

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export default async function LandingPage({ params }: PageProps) {
  const resolvedParams = await params;

  // Determinar el slug: si no hay slug, usar "home" como default
  const slugArray = resolvedParams.slug || [];

  // Si hay más de un segmento, significa que es una ruta anidada que no existe
  // (ej: /home/algo-que-no-existe) - mostrar 404
  if (slugArray.length > 1) {
    notFound();
  }

  const slug = slugArray[0] || 'home';

  // Fetch hero data server-side para eliminar el round-trip extra del client
  const initialData = await fetchHeroData(slug);

  return <LandingPageClient slug={slug} initialData={initialData} />;
}

export async function generateStaticParams() {
  // Pre-generar landings activas para que se sirvan como estáticas
  const slugs = await getActiveLandingSlugs();

  return [
    { slug: [] },
    { slug: ['home'] },
    ...slugs
      .filter(s => s !== 'home')
      .map(s => ({ slug: [s] })),
  ];
}

// Metadata dinámica desde API
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const slugArray = resolvedParams.slug || [];
  const slug = slugArray[0] || 'home';

  // Obtener metadatos desde el API
  const meta = await getLandingMeta(slug);

  // Usar valores del API o fallback a valores por defecto
  return {
    title: meta?.meta_title || `BaldeCash - ${slug === 'home' ? 'Tu laptop para estudiar' : slug}`,
    description: meta?.meta_description || 'Financiamiento de laptops para estudiantes. Sin historial crediticio.',
  };
}
