/**
 * Server Component Wrapper
 */

import type { Metadata } from 'next';
import Client from './confirmacionClient';

// BAL-4188 (Task 10): ver la nota en `../page.tsx`.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Client />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}
