/**
 * Ruta pública `/encuesta/[token]` — encuesta de experiencia post-entrega.
 *
 * Es la URL del botón de la plantilla de WhatsApp: `{FRONTEND_URL}/encuesta/{token}`.
 * `encuesta` es un segmento ESTÁTICO hermano de `[landing]` (no un hijo), así
 * que no colisiona con los slugs de landings ni hereda su chrome — mismo
 * patrón que `kyc/[token]` y `oferta/[token]`.
 *
 * Mínimo a propósito: extrae el `token` y se lo pasa al client component,
 * que hace el fetch y decide la UI (ver `EncuestaClient.tsx`).
 */

import type { Metadata } from 'next';
import { EncuestaClient } from './EncuestaClient';

export const metadata: Metadata = {
  title: 'Encuesta de experiencia | BaldeCash',
  description: 'Cuéntanos cómo fue tu experiencia con BaldeCash.',
  robots: { index: false, follow: false },
};

export default async function EncuestaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <EncuestaClient token={token} />;
}
