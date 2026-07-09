/**
 * Mini-checkout de accesorios y seguros: /oferta/{token}/accesorios (BAL-2064).
 *
 * Server Component. La URL es limpia (sin query params): la selección del equipo
 * (variant/combo/slug + datos) se lee de localStorage en el cliente, guardada al
 * elegir desde catálogo/detalle/portada. Si no hay selección (link directo /
 * storage limpio), el cliente redirige a la portada de la oferta.
 */

import type { Metadata } from 'next';
import { AccesoriosOfertaClient } from './AccesoriosOfertaClient';

export const metadata: Metadata = {
  title: 'Complementos | Mi oferta | BaldeCash',
  description: 'Suma complementos y protección a tu equipo.',
  robots: { index: false, follow: false },
};

export default async function OfertaAccesoriosPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <AccesoriosOfertaClient token={token} />;
}
