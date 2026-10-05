/**
 * Encuesta de experiencia — ruta pública raíz.
 * Ruta: /encuesta/[token]  (coincide con el botón del WhatsApp)
 */
import { EncuestaClient } from '@/app/prototipos/0.6/encuesta/[token]/EncuestaClient';

export default async function EncuestaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <EncuestaClient token={token} />;
}
