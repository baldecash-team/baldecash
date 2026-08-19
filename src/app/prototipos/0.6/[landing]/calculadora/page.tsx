/**
 * Calculadora de matrícula v0.6 - Server Component Wrapper
 *
 * Hermana de `catalogo` dentro del segmento de landing. El producto de matrícula
 * no pasa por catálogo ni por el detalle de producto: entra por acá y sale
 * directo a /solicitar.
 */

import { CalculadoraClient } from './CalculadoraClient';
import { getLandingMeta } from '../../services/landingApi';

export default async function CalculadoraPage() {
  return <CalculadoraClient />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ landing: string }>;
}) {
  const resolvedParams = await params;
  const landing = resolvedParams.landing || 'home';

  const meta = await getLandingMeta(landing);
  const landingName = meta?.name || landing;

  return {
    title: meta?.meta_title
      ? `Calculadora | ${meta.meta_title}`
      : `Calculadora de matrícula - BaldeCash | ${landingName}`,
    description:
      'Calcula la cuota mensual del financiamiento de tu matrícula. Pagamos directo a tu universidad.',
  };
}
