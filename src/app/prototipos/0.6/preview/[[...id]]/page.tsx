/**
 * Landing Preview Page - BaldeCash v0.6
 * Ruta escalable para preview de landing por ID
 *
 * Rutas soportadas:
 * - /prototipos/0.6/preview/?id=16&preview_key=abc123 → ID via query param
 * - /prototipos/0.6/preview/16?preview_key=abc123 → ID via path param
 *
 * Esta ruta NO requiere pre-generación de IDs, funciona con cualquier ID.
 * El preview_key es un hash único por landing que valida el acceso al preview.
 */

import { PreviewPageClient } from './PreviewPageClient';

interface PageProps {
  params: Promise<{
    id?: string[];
  }>;
}

export default async function PreviewPage({ params }: PageProps) {
  const resolvedParams = await params;

  // Extract ID from path if provided (e.g., /preview/16 → id = "16")
  const pathId = resolvedParams.id?.[0] || null;

  return <PreviewPageClient pathId={pathId} />;
}

// Generate static params for static export
// Returns empty + placeholder to allow both /preview and /preview/[id] routes
export function generateStaticParams() {
  return [
    { id: [] }, // Matches /preview (query param mode)
  ];
}
