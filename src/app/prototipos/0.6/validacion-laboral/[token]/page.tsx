/**
 * Validación laboral (autoservicio de video) por link — ruta canónica bajo el base path.
 * En producción, el middleware reescribe /validacion-laboral/[token] → /prototipos/0.6/validacion-laboral/[token].
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
