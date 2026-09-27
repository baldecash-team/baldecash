/**
 * Dynamic Step Page - Server Component
 * Renders any wizard step based on URL slug
 */

import type { Metadata } from 'next';
import StepClient from './StepClient';

// BAL-4188 (Task 10): ver la nota en `../page.tsx`.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StepPage() {
  return <StepClient />;
}

// Pre-generar solo home para build rápido; el resto se genera on-demand en Vercel
export function generateStaticParams() {
  return [{ landing: 'home', stepSlug: 'datos-personales' }];
}
