/**
 * Ruta pública `/kyc/[token]` ("Continuar después") — Server Component.
 *
 * Es exactamente la URL que arma `SecureLinkService.build_url` en el backend
 * y la que manda el link de WhatsApp: `{FRONTEND_URL}/kyc/{token}`. `kyc` es
 * un segmento ESTÁTICO hermano de `[landing]` (no un hijo), así que no
 * colisiona con los slugs de landings — mismo patrón que `oferta/[token]` y
 * `validar-correo/[token]`.
 *
 * Mínimo a propósito: solo extrae el `token` y se lo pasa al client
 * component, que hace el canje y decide la UI (ver `ResumeClient.tsx`).
 */

import type { Metadata } from 'next';
import { ResumeClient } from './ResumeClient';

export const metadata: Metadata = {
  title: 'Continuar solicitud | BaldeCash',
  description: 'Retoma tu solicitud donde la dejaste.',
  robots: { index: false, follow: false },
};

export default async function KycResumePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ResumeClient token={token} />;
}
