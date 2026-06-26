/**
 * Validación laboral (autoservicio de video) por link — ruta pública raíz.
 * Ruta: /validacion-laboral/[token]  (coincide con los links que recibe el usuario)
 */
import { ValidacionLaboralClient } from '@/app/prototipos/0.6/admision/validacion-laboral/[token]/ValidacionLaboralClient';

export default async function ValidacionLaboralPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ValidacionLaboralClient token={token} />;
}
