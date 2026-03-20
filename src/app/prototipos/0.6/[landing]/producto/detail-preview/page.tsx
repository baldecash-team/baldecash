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

export function generateStaticParams() {
  return [{ landing: 'home' }];
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
