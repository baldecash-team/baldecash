/**
 * Landing Page - BaldeCash v0.6
 * Ruta dinámica que carga datos desde el backend API (client-side fetch)
 *
 * Rutas:
 * - /prototipos/0.6/ → slug = "home" (default)
 * - /prototipos/0.6/home → slug = "home"
 * - /prototipos/0.6/laptops-estudiantes → slug = "laptops-estudiantes"
 */

import { LandingPageClient } from './LandingPageClient';

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export default async function LandingPage({ params }: PageProps) {
  const resolvedParams = await params;

  // Determinar el slug: si no hay slug, usar "home" como default
  const slugArray = resolvedParams.slug || [];
  const slug = slugArray[0] || 'home';

  // Pasar solo el slug al cliente - el fetch ocurre en el cliente
  return <LandingPageClient slug={slug} />;
}

// Generar rutas estáticas para output: export
export async function generateStaticParams() {
  const knownSlugs = [
    'home',
    'laptops-estudiantes',
    'celulares-2026',
    'motos-lima',
  ];

  return [
    { slug: [] },
    ...knownSlugs.map((s) => ({ slug: [s] })),
  ];
}

// Metadata estática
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const slugArray = resolvedParams.slug || [];
  const slug = slugArray[0] || 'home';

  return {
    title: `BaldeCash - ${slug === 'home' ? 'Tu laptop para estudiar' : slug}`,
    description: 'Financiamiento de laptops para estudiantes. Sin historial crediticio.',
  };
}
