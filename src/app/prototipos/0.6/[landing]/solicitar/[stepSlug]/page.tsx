/**
 * Dynamic Step Page - Server Component
 * Renders any wizard step based on URL slug
 */

import StepClient from './StepClient';

export default function StepPage() {
  return <StepClient />;
}

// Pre-generar solo home para build rápido; el resto se genera on-demand en Vercel
export function generateStaticParams() {
  return [{ landing: 'home', stepSlug: 'datos-personales' }];
}
