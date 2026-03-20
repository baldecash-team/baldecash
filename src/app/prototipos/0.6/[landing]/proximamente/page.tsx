/**
 * Próximamente - BaldeCash v0.6
 * Server Component wrapper for static export
 */

import { ProximamenteClient } from './ProximamenteClient';

export function generateStaticParams() {
  return [{ landing: 'home' }];
}

export default function ProximamentePage() {
  return <ProximamenteClient />;
}
