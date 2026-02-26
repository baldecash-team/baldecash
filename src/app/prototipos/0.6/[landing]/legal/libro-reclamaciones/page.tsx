/**
 * Libro de Reclamaciones - BaldeCash v0.6
 * Server Component wrapper for static export
 */

import { LibroReclamacionesClient } from './LibroReclamacionesClient';

// Generate static params for all known landings
export function generateStaticParams() {
  return [
    { landing: 'home' },
    { landing: 'laptops-estudiantes' },
    { landing: 'celulares-2026' },
    { landing: 'motos-lima' },
  ];
}

export default function LibroReclamacionesPage() {
  return <LibroReclamacionesClient />;
}
