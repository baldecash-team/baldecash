/**
 * Product Detail v0.6 - Server Component Wrapper
 * Catch-all route para manejar cualquier slug de producto
 */

import { ProductDetailClient } from './ProductDetailClient';
import { GamerProductDetailClient } from '../GamerProductDetailClient';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ landing: string; slug: string[] }>;
}) {
  const resolvedParams = await params;
  const landing = resolvedParams.landing || 'home';

  if (landing === 'zona-gamer') {
    return <GamerProductDetailClient />;
  }

  return <ProductDetailClient />;
}

// Pre-generar solo home para build rápido; el resto se genera on-demand en Vercel
export function generateStaticParams() {
  return [{ landing: 'home', slug: ['laptop'] }];
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
