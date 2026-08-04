/**
 * Calculadora de efectivo v0.6 - Server Component Wrapper
 *
 * Ruta a la que `catalogo/page.tsx` redirige cuando la landing tiene la
 * calculadora habilitada (ver `getCalculadora`). Gate fail-safe: si por
 * cualquier razón (entrada directa por URL, config cambiada) la landing NO
 * tiene la calculadora habilitada, redirige al home de la landing en vez de
 * mostrar una pantalla rota.
 */

import { redirect } from 'next/navigation';
import { fetchLandingConfig } from '../../services/landingConfigApi';
import { getCalculadora } from '../../types/landingConfig';
import { routes } from '../../utils/routes';
import { CalculadoraClient } from './CalculadoraClient';

export default async function CalculadoraPage({
  params,
}: {
  params: Promise<{ landing: string }>;
}) {
  const { landing } = await params;
  const landingConfig = await fetchLandingConfig(landing);
  const calculadora = getCalculadora(landingConfig);

  if (!calculadora) {
    redirect(routes.landingHome(landing));
  }

  return <CalculadoraClient landing={landing} config={calculadora} />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}
