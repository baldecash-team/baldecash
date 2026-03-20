/**
 * Libro de Reclamaciones - BaldeCash v0.6
 * Server Component wrapper for static export
 */

import { LibroReclamacionesClient } from './LibroReclamacionesClient';

export function generateStaticParams() {
  return [{ landing: 'home' }];
}

export default function LibroReclamacionesPage() {
  return <LibroReclamacionesClient />;
}
