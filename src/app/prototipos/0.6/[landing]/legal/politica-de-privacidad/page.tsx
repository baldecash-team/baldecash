/**
 * Política de Privacidad - BaldeCash v0.6
 * Server Component wrapper for static export
 */

import { PoliticaDePrivacidadClient } from './PoliticaDePrivacidadClient';

export function generateStaticParams() {
  return [{ landing: 'home' }];
}

export default function PoliticaDePrivacidadPage() {
  return <PoliticaDePrivacidadClient />;
}
