/**
 * Selección de institución v0.6 - Server Component Wrapper
 *
 * Primera pantalla del producto de matrícula. Ocupa el lugar que en el recorrido
 * de equipos ocupa el catálogo.
 */

import { UniversidadClient } from './UniversidadClient';
import { getLandingMeta } from '../../services/landingApi';

export default async function UniversidadPage() {
  return <UniversidadClient />;
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
      ? `Elige tu universidad | ${meta.meta_title}`
      : `Elige tu universidad - BaldeCash | ${landingName}`,
    description: 'Elige tu institución para continuar con el financiamiento de tu matrícula.',
  };
}
