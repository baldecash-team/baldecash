/**
 * Solicitar - Server Component Wrapper
 */

import SolicitarClient from './solicitarClient';

export default function SolicitarPage() {
  return <SolicitarClient />;
}

export async function generateStaticParams() {
  return [
    { landing: 'home' },
    { landing: 'laptops-estudiantes' },
    { landing: 'celulares-2026' },
    { landing: 'motos-lima' },
  ];
}
