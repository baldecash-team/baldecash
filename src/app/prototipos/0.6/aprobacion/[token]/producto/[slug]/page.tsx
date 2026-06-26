/**
 * Detalle de producto en contexto de OFERTA (Caso 4 · BAL-1785).
 * Ruta: /aprobacion/{token}/producto/{slug}
 *
 * Reutiliza el componente ProductDetail real, pero el CTA es "Elegir este
 * equipo" (registra la selección vía /select) — NUNCA navega a /solicitar.
 */

import type { Metadata } from 'next';
import { OfertaDetalleClient } from './OfertaDetalleClient';

export const metadata: Metadata = {
  title: 'Detalle | Mi oferta | BaldeCash',
  robots: { index: false, follow: false },
};

export default async function OfertaProductoPage({
  params,
}: {
  params: Promise<{ token: string; slug: string }>;
}) {
  const { token, slug } = await params;
  return <OfertaDetalleClient token={token} slug={slug} />;
}
