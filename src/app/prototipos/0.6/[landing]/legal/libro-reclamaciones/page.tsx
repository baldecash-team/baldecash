/**
 * Libro de Reclamaciones - BaldeCash v0.6
 * Server Component wrapper for static export
 */

import { LibroReclamacionesClient } from './LibroReclamacionesClient';

// Generate static params from API
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
    // API unavailable, using fallback
  }

  return slugs.map((landing) => ({ landing }));
}

export default function LibroReclamacionesPage() {
  return <LibroReclamacionesClient />;
}
