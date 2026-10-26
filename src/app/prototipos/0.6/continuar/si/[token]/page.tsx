/**
 * Ruta pública `/continuar/si/[token]` — botón "Sí, continuar" del WhatsApp
 * que pregunta si el cliente sigue con su solicitud.
 */

import type { Metadata } from 'next';
import { ContinuarClient } from '../../ContinuarClient';

export const metadata: Metadata = {
  title: 'Tu solicitud | BaldeCash',
  robots: { index: false, follow: false },
};

export default async function ContinuarSiPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ContinuarClient token={token} acepta={true} />;
}
