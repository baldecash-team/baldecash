/**
 * Mini-checkout de accesorios y seguros: /oferta/{token}/accesorios (BAL-2064).
 *
 * Server Component. El detalle del producto navega aquí tras "Elegir este equipo"
 * (con ?variant=&slug=). El cliente suma accesorios/seguros que caben en su
 * cuota restante y confirma todo junto. Reutiliza la UX del flujo regular
 * (AccessoryCard / InsuranceCards).
 */

import type { Metadata } from 'next';
import { AccesoriosOfertaClient } from './AccesoriosOfertaClient';

export const metadata: Metadata = {
  title: 'Accesorios y seguros | Mi oferta | BaldeCash',
  description: 'Suma accesorios y protección a tu equipo.',
  robots: { index: false, follow: false },
};

export default async function OfertaAccesoriosPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ variant?: string; combo?: string; slug?: string }>;
}) {
  const { token } = await params;
  const { variant, combo, slug } = await searchParams;
  return (
    <AccesoriosOfertaClient
      token={token}
      variantId={variant ? Number(variant) : null}
      comboId={combo ? Number(combo) : null}
      slug={slug ?? null}
    />
  );
}
