/**
 * Empty State Preview v0.6 - Server Component Wrapper
 */

import EmptyPreviewClient from './EmptyPreviewClient';

export default function EmptyStatePreviewPage() {
  return <EmptyPreviewClient />;
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
    console.log('[empty-preview/generateStaticParams] Using fallback (API unavailable)');
  }

  return slugs.map((landing) => ({ landing }));
}
