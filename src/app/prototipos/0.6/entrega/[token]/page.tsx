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
import { EntregaTokenClient } from '../components/EntregaTokenClient';

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
  // El formulario portado de Zona Clientes (hero con pasos, tarjeta del equipo,
  // direccion con Google Maps y cascada de ubigeo, quien recibe, tipo de envio
  // y cierre con resumen). `EntregaClient` era la version anterior, sin diseno.
  return (
    <main className="min-h-screen bg-[#F7F7FB] px-4 py-8">
      <EntregaTokenClient token={token} />
    </main>
  );
}
