/**
 * Server Component Wrapper
 */

import Client from './segurosClient';

export default function Page() {
  return <Client />;
}

export async function generateStaticParams() {
  return [
    { landing: 'home' },
    { landing: 'laptops-estudiantes' },
    { landing: 'celulares-2026' },
    { landing: 'motos-lima' },
  ];
}
