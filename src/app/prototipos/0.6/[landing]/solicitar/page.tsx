/**
 * Solicitar - Server Component Wrapper
 */

import type { Metadata } from 'next';
import SolicitarClient from './solicitarClient';

// BAL-4188 (Task 10): todo `/solicitar/*` es un link de flujo (WhatsApp,
// correo, "continuar despues"), no una pagina para buscador. El `layout.tsx`
// de este segmento es 'use client' y no puede exportar `metadata`, asi que
// va en cada `page.tsx` del subarbol.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SolicitarPage({
  params,
}: {
  params: Promise<{ landing: string }>;
}) {
  return <SolicitarClient />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}
