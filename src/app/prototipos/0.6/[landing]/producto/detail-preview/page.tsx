/**
 * Product Detail Preview v0.6 - Server Component Wrapper
 *
 * Consume data real del API. Acceder via:
 * /prototipos/0.6/{landing}/producto/detail-preview?id={productId}
 */

import { ProductDetailClient } from './ProductDetailClient';

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}

// Generar rutas estaticas para output: export
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
    console.log('[detail-preview/generateStaticParams] Using fallback (API unavailable)');
  }

  return slugs.map((landing) => ({ landing }));
}

// Metadata estatica
export async function generateMetadata({
  params,
}: {
  params: Promise<{ landing: string }>;
}) {
  const resolvedParams = await params;
  const landing = resolvedParams.landing || 'home';

  return {
    title: `Detalle de Producto - BaldeCash ${landing === 'home' ? '' : `| ${landing}`}`,
    description: 'Conoce todos los detalles de este producto y solicita tu financiamiento.',
  };
}
