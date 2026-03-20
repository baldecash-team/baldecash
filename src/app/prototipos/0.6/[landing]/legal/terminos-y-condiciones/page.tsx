/**
 * Términos y Condiciones - BaldeCash v0.6
 * Server Component wrapper for static export
 */

import { TerminosYCondicionesClient } from './TerminosYCondicionesClient';

export function generateStaticParams() {
  return [{ landing: 'home' }];
}

export default function TerminosYCondicionesPage() {
  return <TerminosYCondicionesClient />;
}
