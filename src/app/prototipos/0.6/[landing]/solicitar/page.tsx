/**
 * Solicitar - Server Component Wrapper
 */

import SolicitarClient from './solicitarClient';

export default async function SolicitarPage({
  params,
}: {
  params: Promise<{ landing: string }>;
}) {
  return <SolicitarClient />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}
