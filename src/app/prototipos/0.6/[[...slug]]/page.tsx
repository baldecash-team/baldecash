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
import { getLandingMeta } from '../services/landingApi';

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

  // Pasar solo el slug al cliente - el fetch ocurre en el cliente
  return <LandingPageClient slug={slug} />;
}

// Generar rutas estáticas para output: export
export async function generateStaticParams() {
  // Fallback slugs en caso de que la API no esté disponible
  const fallbackSlugs = [
    'home',
    'laptops-estudiantes',
    'celulares-2026',
    'motos-lima',
  ];

  // Intentar obtener landings desde la API durante el build
  let slugs = fallbackSlugs;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ws2-production-0f0e.up.railway.app/api/v1';
    const response = await fetch(`${apiUrl}/public/landing/list/slugs`, {
      cache: 'no-store', // Siempre obtener datos frescos durante build
    });

    if (response.ok) {
      const data = await response.json();
      if (data.slugs && Array.isArray(data.slugs)) {
        // Combinar con fallback para asegurar que siempre tenemos algunos
        slugs = [...new Set([...fallbackSlugs, ...data.slugs])];
        console.log(`[generateStaticParams] Found ${data.slugs.length} landings from API`);
      }
    }
  } catch (error) {
    // API no disponible durante build - usar fallback
    console.log('[generateStaticParams] Using fallback slugs (API unavailable)');
  }

  return [
    { slug: [] }, // Ruta raíz /prototipos/0.6/
    ...slugs.map((s) => ({ slug: [s] })),
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
