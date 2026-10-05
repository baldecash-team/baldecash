/**
 * Subruta de catálogo de la oferta: /oferta/{token}/catalogo — Server Component.
 *
 * "Ver otros equipos" en la página principal navega aquí (ya no scroll inline).
 * Muestra el catálogo filtrado por la cuota del token, a página completa.
 */

import type { Metadata } from 'next';
import { CatalogoOfertaClient } from './CatalogoOfertaClient';

export const metadata: Metadata = {
  title: 'Catálogo | Mi oferta | BaldeCash',
  description: 'Elige entre los equipos disponibles para tu oferta.',
  robots: { index: false, follow: false },
};

export default async function OfertaCatalogoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <CatalogoOfertaClient token={token} />;
}
