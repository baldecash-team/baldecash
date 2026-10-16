/**
 * Ruta pública `/retomar/si/[token]` — botón «Si» del WhatsApp de la campaña
 * decil 9. En producción el middleware reescribe `/retomar/...` a
 * `/prototipos/0.6/retomar/...`, igual que `/encuesta/[token]`.
 */

import type { Metadata } from 'next';
import { RetomarClient } from '../../RetomarClient';

export const metadata: Metadata = {
  title: 'Tu solicitud | BaldeCash',
  robots: { index: false, follow: false },
};

export default async function RetomarSiPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <RetomarClient token={token} acepta={true} />;
}
