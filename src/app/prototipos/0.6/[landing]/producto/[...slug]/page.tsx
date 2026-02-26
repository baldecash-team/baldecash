/**
 * Product Detail v0.6 - Server Component Wrapper
 * Catch-all route para manejar cualquier slug de producto
 */

import { ProductDetailClient } from './ProductDetailClient';

// Permitir rutas dinámicas en desarrollo
// En producción con output: export, generateStaticParams debe incluir todos los slugs
export const dynamicParams = true;

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}

// Generar algunas rutas estáticas para output: export
export async function generateStaticParams() {
  const knownLandings = [
    'home',
    'laptops-estudiantes',
    'celulares-2026',
    'motos-lima',
  ];

  // Slugs conocidos para productos de ejemplo (como array para catch-all)
  // Includes both mock data slugs and API-seeded products
  const knownSlugs = [
    // API-seeded products
    'hp-pavilion-15-ryzen5',
    'thinkpad-x1-carbon-gen11',
    'dell-inspiron-14-i5',
    'macbook-pro-14-m3-pro',
    'ipad-pro-11-m4-256gb-wifi',
    'iphone-15-pro-256gb',
    'samsung-galaxy-s24-ultra-256gb',
    // Mock data slugs
    'lenovo-v15-g4-ryzen5-8gb-256ssd',
    'ipad-pro-12-m4',
    'iphone-16-pro-max',
  ];

  // Generar todas las combinaciones de landing + slug (slug como array)
  return knownLandings.flatMap((landing) =>
    knownSlugs.map((s) => ({ landing, slug: [s] }))
  );
}

// Metadata estática
export async function generateMetadata({
  params,
}: {
  params: Promise<{ landing: string; slug: string[] }>;
}) {
  const resolvedParams = await params;
  const slugArray = resolvedParams.slug || [];
  const slug = slugArray[0] || '';

  // Formatear slug para título
  const productName = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${productName} - BaldeCash`,
    description: `Conoce los detalles del ${productName} y solicita tu financiamiento con BaldeCash.`,
  };
}
