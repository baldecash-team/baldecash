/**
 * Ruta pública `/continuar/no/[token]` — botón "No, desistir" del WhatsApp
 * que pregunta si el cliente sigue con su solicitud.
 */

import type { Metadata } from 'next';
import { ContinuarClient } from '../../ContinuarClient';

export const metadata: Metadata = {
  title: 'Tu solicitud | BaldeCash',
  robots: { index: false, follow: false },
};

export default async function ContinuarNoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ContinuarClient token={token} acepta={false} />;
}
