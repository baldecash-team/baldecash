/**
 * Landing Preview Page by ID - BaldeCash v0.6
 * Ruta para preview de landing por ID (usado desde admin)
 *
 * Rutas:
 * - /prototipos/0.6/preview/1?preview_key=abc123... → Landing ID 1 en modo preview seguro
 *
 * El preview_key es un hash único por landing que valida el acceso al preview.
 * Sin preview_key válido, solo se pueden ver landings con status=ACTIVE.
 */

import { notFound } from 'next/navigation';
import { LandingPreviewClient } from './LandingPreviewClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LandingPreviewPage({ params }: PageProps) {
  const resolvedParams = await params;
  const landingId = parseInt(resolvedParams.id, 10);

  // Validate ID is a number
  if (isNaN(landingId) || landingId <= 0) {
    notFound();
  }

  return <LandingPreviewClient landingId={landingId} />;
}

// Con output: export, solo funcionan rutas pre-generadas en generateStaticParams
export const dynamicParams = false;

// Pre-generate placeholder routes - actual data is fetched client-side
export function generateStaticParams() {
  // Generate common landing IDs (1-10) to cover most cases
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: '7' },
    { id: '8' },
    { id: '9' },
    { id: '10' },
  ];
}
