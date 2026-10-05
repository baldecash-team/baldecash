/**
 * Validación laboral (autoservicio de video) por link — Server Component Wrapper.
 * Ruta: /prototipos/0.6/admision/validacion-laboral/[token]
 */
import { ValidacionLaboralClient } from './ValidacionLaboralClient';

export default async function ValidacionLaboralPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ValidacionLaboralClient token={token} />;
}
