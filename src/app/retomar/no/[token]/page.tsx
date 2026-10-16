/**
 * Campaña decil 9 — ruta pública raíz `/retomar/no/[token]` (URL limpia en dev,
 * como `src/app/encuesta/[token]`). En producción la sirve
 * `prototipos/0.6/retomar/no/[token]` por el rewrite del middleware.
 */
import { RetomarClient } from '@/app/prototipos/0.6/retomar/RetomarClient';

export default async function RetomarNoRootPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <RetomarClient token={token} acepta={false} />;
}
