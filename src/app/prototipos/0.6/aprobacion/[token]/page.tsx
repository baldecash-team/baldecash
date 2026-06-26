/**
 * Página "Mi Oferta" (Mockup 4 · Caso 4 · BAL-1785) — Server Component.
 *
 * Ruta pública por token de secure-link: /aprobacion/{token}.
 * `aprobacion` es un segmento ESTÁTICO → tiene prioridad sobre el [landing]
 * dinámico, así que no colisiona con los slugs de landings.
 *
 * Renderiza el cliente; los datos se cargan client-side por token (no-store).
 */

import type { Metadata } from 'next';
import { MiOfertaClient } from './MiOfertaClient';

export const metadata: Metadata = {
  title: 'Mi oferta | BaldeCash',
  description: 'Tu oferta personalizada de BaldeCash.',
  robots: { index: false, follow: false },
};

export default async function AprobacionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <MiOfertaClient token={token} />;
}
