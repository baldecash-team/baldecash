/**
 * Server Component Wrapper — Verificación de correo (OTP inline).
 */

import type { Metadata } from 'next';
import VerificacionClient from './verificacionClient';

// BAL-4188 (Task 10): ver la nota en `../page.tsx`.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function VerificacionPage() {
  return <VerificacionClient />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}
