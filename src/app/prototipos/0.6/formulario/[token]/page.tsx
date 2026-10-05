/**
 * Ruta pública `/formulario/[token]` — Server Component.
 *
 * Es la URL que arma el backend para el purpose `followup_form`
 * (`{FOLLOWUP_FORM_BASE_URL o FRONTEND_URL}/formulario/{token}`) y la que
 * manda el WhatsApp después de dejar la solicitud. `formulario` es un segmento
 * ESTÁTICO hermano de `[landing]` (no un hijo), así que no colisiona con los
 * slugs de landings — mismo patrón que `entrega/[token]` y `kyc/[token]`.
 *
 * Mínimo a propósito: extrae el `token` y se lo pasa al client component, que
 * hace el canje y decide la UI.
 */

import type { Metadata } from 'next';
import { FormularioClient } from './FormularioClient';

export const metadata: Metadata = {
  title: 'Completa tu solicitud | BaldeCash',
  description: 'Sube tus documentos y elige cuándo hablar con tu asesor.',
  robots: { index: false, follow: false },
};

export default async function FormularioPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <FormularioClient token={token} />;
}
