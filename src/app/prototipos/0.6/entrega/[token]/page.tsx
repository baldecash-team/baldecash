/**
 * Ruta pública `/entrega/[token]` — Server Component.
 *
 * Es exactamente la URL que arma `SecureLinkService.build_url` en el backend
 * para el purpose `delivery_form`, y la que manda el WhatsApp:
 * `{FRONTEND_URL}/entrega/{token}`. `entrega` es un segmento ESTÁTICO hermano
 * de `[landing]` (no un hijo), así que no colisiona con los slugs de landings
 * — mismo patrón que `kyc/[token]` y `oferta/[token]`.
 *
 * Mínimo a propósito: extrae el `token` y se lo pasa al client component, que
 * hace el canje y decide la UI.
 */

import type { Metadata } from 'next';
import { EntregaClient } from './EntregaClient';

export const metadata: Metadata = {
  title: 'Coordina tu entrega | BaldeCash',
  description: 'Confirma dónde y quién recibe tu equipo.',
  robots: { index: false, follow: false },
};

export default async function EntregaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <EntregaClient token={token} />;
}
