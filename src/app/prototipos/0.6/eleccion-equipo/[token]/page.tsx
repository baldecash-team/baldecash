/**
 * Ruta pública `/eleccion-equipo/[token]` — Server Component.
 *
 * Es exactamente la URL que arma `SecureLinkService.build_url` en el backend
 * para el purpose `equipment_selection`, y la que manda el WhatsApp:
 * `{FRONTEND_URL}/eleccion-equipo/{token}`.
 *
 * `eleccion-equipo` es un segmento ESTÁTICO hermano de `[landing]` (no un
 * hijo) — mismo patrón que `entrega`, `kyc`, `oferta` y `videollamada`. Si
 * colgara de `[landing]`, el middleware reescribiría el path a
 * `/prototipos/0.6/{path}` y el link del WhatsApp no resolvería.
 *
 * Mínimo a propósito: extrae el `token` y se lo pasa al client component, que
 * hace el canje y decide la UI.
 */

import type { Metadata } from 'next';
import { EleccionEquipoClient } from './EleccionEquipoClient';

export const metadata: Metadata = {
  title: 'Elige tu equipo | BaldeCash',
  description: 'Mira las unidades disponibles y elige la tuya.',
  robots: { index: false, follow: false },
};

export default async function EleccionEquipoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <EleccionEquipoClient token={token} />;
}
