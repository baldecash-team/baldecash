/**
 * Server Component Wrapper — Verificación de correo (OTP inline).
 */

import VerificacionClient from './verificacionClient';

export default function VerificacionPage() {
  return <VerificacionClient />;
}

export function generateStaticParams() {
  return [{ landing: 'home' }];
}
