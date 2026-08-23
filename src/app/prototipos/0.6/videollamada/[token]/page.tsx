/**
 * Videollamada con el asesor por link — ruta canónica bajo el base path.
 *
 * En producción el middleware reescribe /videollamada/[token] →
 * /prototipos/0.6/videollamada/[token]. Sin ESTA página, la de la raíz nunca
 * se alcanza: la petición cae en el catch-all /prototipos/0.6/[[...slug]] y
 * devuelve 404. Mismo trío que `validar-correo` y `validacion-laboral`.
 */
import { VideollamadaClient } from '@/app/prototipos/0.6/admision/videollamada/[token]/VideollamadaClient';

export default async function VideollamadaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <VideollamadaClient token={token} />;
}
