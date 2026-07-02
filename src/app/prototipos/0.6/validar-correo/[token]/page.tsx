/**
 * Validación de correo por link — ruta canónica bajo el base path.
 * En producción, el middleware reescribe /validar-correo/[token] → /prototipos/0.6/validar-correo/[token].
 */
import { ValidarCorreoClient } from '@/app/prototipos/0.6/admision/validar-correo/[token]/ValidarCorreoClient';

export default async function ValidarCorreoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ValidarCorreoClient token={token} />;
}
