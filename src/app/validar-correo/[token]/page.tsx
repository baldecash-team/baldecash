/**
 * Validación de correo por link — ruta pública raíz.
 * Ruta: /validar-correo/[token]  (coincide con los links que recibe el usuario)
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
