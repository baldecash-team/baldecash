/**
 * Solicitar - Server Component Wrapper
 */

import SolicitarClient from './solicitarClient';

export default function SolicitarPage() {
  return <SolicitarClient />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}
