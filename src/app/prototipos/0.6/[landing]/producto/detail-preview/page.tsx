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
  const knownLandings = [
    'home',
    'laptops-estudiantes',
    'celulares-2026',
    'motos-lima',
  ];

  return knownLandings.map((landing) => ({ landing }));
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
