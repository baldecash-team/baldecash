import type { Metadata } from 'next';

// BAL-4188: la confirmacion muestra datos del cliente (nombre, equipo, cuota).
// No debe aparecer en buscadores. SOLO esta pagina: el resto de /solicitar/
// sigue indexable (~13 sesiones/dia entran al formulario desde google.com).
// No va en robots.txt: si Google no puede entrar, tampoco lee este noindex.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Server Component Wrapper
 */

import Client from './confirmacionClient';

export default function Page() {
  return <Client />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}
