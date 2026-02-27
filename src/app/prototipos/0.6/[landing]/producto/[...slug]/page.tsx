/**
 * Product Detail v0.6 - Server Component Wrapper
 * Catch-all route para manejar cualquier slug de producto
 */

import { ProductDetailClient } from './ProductDetailClient';

// Con output: export, solo funcionan rutas pre-generadas en generateStaticParams
export const dynamicParams = false;

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}

// Generar rutas estáticas desde la API con fallback para desarrollo local
export async function generateStaticParams() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1';

  // Fallbacks para cuando la BD local está desactualizada
  let landings = ['home'];
  let productSlugs = [
    'hp-pavilion-15-ryzen5',
    'macbook-pro-14-m3-pro',
    'thinkpad-x1-carbon-gen11',
    'dell-inspiron-14-i5',
    'iphone-15-pro-256gb',
    'samsung-galaxy-s24-ultra-256gb',
    'ipad-pro-11-m4-256gb-wifi',
  ];

  try {
    const [landingsRes, productsRes] = await Promise.all([
      fetch(`${apiUrl}/public/landing/list/slugs`, { cache: 'no-store' }),
      fetch(`${apiUrl}/public/products/list/slugs`, { cache: 'no-store' }),
    ]);

    if (landingsRes.ok) {
      const data = await landingsRes.json();
      if (data.slugs?.length) landings = data.slugs;
    }

    if (productsRes.ok) {
      const data = await productsRes.json();
      if (data.slugs?.length) productSlugs = data.slugs;
    }
  } catch {
    console.log('[generateStaticParams:producto] Using fallbacks (API unavailable)');
  }

  return landings.flatMap((landing) =>
    productSlugs.map((s) => ({ landing, slug: [s] }))
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
