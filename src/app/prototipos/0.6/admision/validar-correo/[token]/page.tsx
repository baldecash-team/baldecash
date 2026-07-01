/**
 * Validación de correo por link — Server Component Wrapper.
 * Ruta: /prototipos/0.6/admision/validar-correo/[token]
 */
import { ValidarCorreoClient } from './ValidarCorreoClient';

export default async function ValidarCorreoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ValidarCorreoClient token={token} />;
}
