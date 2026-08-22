/**
 * Videollamada con el asesor por link — ruta pública raíz.
 * Ruta: /videollamada/[token]  (coincide con PURPOSE_PATHS[VIDEO_CALL] del backend)
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
