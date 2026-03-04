/**
 * Wizard Preview Page - BaldeCash v0.6
 * Ruta para preview del wizard de solicitar por ID
 *
 * Rutas soportadas:
 * - /prototipos/0.6/preview-wizard/6?preview_key=abc123 → Landing ID via path
 * - /prototipos/0.6/preview-wizard/6/datos-personales?preview_key=abc123 → Con step específico
 *
 * El preview_key es un hash único por landing que valida el acceso al preview.
 */

import { WizardPreviewClient } from './WizardPreviewClient';

interface PageProps {
  params: Promise<{
    params?: string[];
  }>;
}

export default async function WizardPreviewPage({ params }: PageProps) {
  const resolvedParams = await params;

  // Extract ID and optional step from path
  // /preview-wizard/6 → pathId = "6", stepSlug = null
  // /preview-wizard/6/datos-personales → pathId = "6", stepSlug = "datos-personales"
  const pathId = resolvedParams.params?.[0] || null;
  const stepSlug = resolvedParams.params?.[1] || null;

  return <WizardPreviewClient pathId={pathId} stepSlug={stepSlug} />;
}

// Generate static params for static export
export function generateStaticParams() {
  return [
    { params: [] }, // Matches /preview-wizard (base route)
  ];
}
