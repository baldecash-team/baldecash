/**
 * Dynamic Step Page - Server Component
 * Renders any wizard step based on URL slug
 */

import StepClient from './StepClient';

export default function StepPage() {
  return <StepClient />;
}

export async function generateStaticParams() {
  // Return empty array - steps are dynamic from API
  return [];
}
