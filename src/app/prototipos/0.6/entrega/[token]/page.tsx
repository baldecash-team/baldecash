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
import { EntregaConChrome } from '../components/EntregaConChrome';

export const metadata: Metadata = {
  title: 'Coordina tu entrega | BaldeCash',
  description: 'Confirma dónde y quién recibe tu equipo.',
  robots: { index: false, follow: false },
};

export default async function EntregaPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ volver?: string }>;
}) {
  const { token } = await params;
  // A dónde sigue el flujo al terminar. Lo pone quien manda acá (el cierre del
  // KYC); abierto desde el WhatsApp no viene, y ahí el formulario cierra en su
  // propia pantalla de "envío registrado".
  const { volver } = await searchParams;
  // El formulario portado de Zona Clientes (hero con pasos, tarjeta del equipo,
  // direccion con Google Maps y cascada de ubigeo, quien recibe, tipo de envio
  // y cierre con resumen). `EntregaClient` era la version anterior, sin diseno.
  //
  // `EntregaConChrome` decide si esta pantalla se ve como el resto del wizard
  // de la landing (navbar + footer, igual que `…/solicitar/resumen`) o
  // standalone (panel de marca), según pueda resolver la landing del flujo —
  // ver el comentario de ese componente para el criterio completo.
  return <EntregaConChrome token={token} volver={volver} />;
}
