/**
 * Solicitar - Server Component Wrapper
 */

import SolicitarClient from './solicitarClient';
import { GamerSolicitarClient } from './GamerSolicitarClient';

export default async function SolicitarPage({
  params,
}: {
  params: Promise<{ landing: string }>;
}) {
  const resolvedParams = await params;
  const landing = resolvedParams.landing || 'home';

  if (landing === 'zona-gamer') {
    return <GamerSolicitarClient />;
  }

  return <SolicitarClient />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}
