/**
 * Botón "No, desistir" del WhatsApp — ruta pública raíz `/continuar/no/[token]`
 * (URL limpia en dev, como `src/app/retomar/no/[token]`). En producción la
 * sirve `prototipos/0.6/continuar/no/[token]` por el rewrite genérico del
 * middleware (no hace falta una regla propia: `/continuar` no está en la
 * allowlist de `esRutaInterna`, igual que `/retomar`).
 */
import { ContinuarClient } from '@/app/prototipos/0.6/continuar/ContinuarClient';

export default async function ContinuarNoRootPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ContinuarClient token={token} acepta={false} />;
}
