/**
 * Próximamente - BaldeCash v0.6
 * Server Component wrapper for static export
 */

import { ProximamenteClient } from './ProximamenteClient';

// Generate static params for all known landings
export function generateStaticParams() {
  return [
    { landing: 'home' },
    { landing: 'laptops-estudiantes' },
    { landing: 'celulares-2026' },
    { landing: 'motos-lima' },
  ];
}

export default function ProximamentePage() {
  return <ProximamenteClient />;
}
