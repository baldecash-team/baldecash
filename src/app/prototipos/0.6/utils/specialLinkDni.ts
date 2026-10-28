/**
 * Link especial: el DNI se valida apenas el estudiante lo escribe.
 *
 * El pase es personal (un DNI). Antes, quien abría el link con otro DNI recién
 * se enteraba al enviar, al final del formulario. Ahora el campo del documento
 * le pregunta al resolver público si ese DNI es el del pase; el backend nunca
 * devuelve el DNI, solo `dni_matches`.
 *
 * Es un aviso temprano, no la validación: ante cualquier duda (red caída,
 * HTTP de error, respuesta sin `dni_matches`, switch apagado) no se bloquea y
 * el envío lo vuelve a validar igual.
 */
import * as Sentry from '@sentry/nextjs';
import { MENSAJE_LINK_ESPECIAL_VENCIDO } from './specialLink';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export const MENSAJE_LINK_ESPECIAL_DNI = 'Este link es personal y no corresponde a tu DNI.';

/** `{error: null}` = el DNI es el del pase; `{error}` = bloquear; `null` = no se sabe. */
export type ChequeoDniLinkEspecial = { error: string | null } | null;

interface RespuestaResolver {
  valid?: boolean;
  reason?: string | null;
  dni_matches?: boolean | null;
}

export async function verificarDniDelLinkEspecial(
  token: string,
  landing: string,
  dni: string,
): Promise<ChequeoDniLinkEspecial> {
  const qs = new URLSearchParams({ landing, dni });
  let res: Response;
  try {
    res = await fetch(
      `${API_BASE_URL}/public/special-link/${encodeURIComponent(token)}?${qs.toString()}`,
      { headers: { Accept: 'application/json' } },
    );
  } catch {
    // Sin red no se bloquea: el envío decide.
    return null;
  }
  if (!res.ok) return null;
  let body: RespuestaResolver;
  try {
    body = await res.json();
  } catch (error) {
    Sentry.captureException(error, { tags: { modulo: 'link_especial', accion: 'verificar_dni' } });
    return null;
  }
  if (body.valid === false) {
    // Con el switch apagado el envío ignora el token: no hay pase que avisar.
    if (body.reason === 'disabled') return null;
    return { error: MENSAJE_LINK_ESPECIAL_VENCIDO };
  }
  if (body.valid === true && body.dni_matches === true) return { error: null };
  if (body.valid === true && body.dni_matches === false) return { error: MENSAJE_LINK_ESPECIAL_DNI };
  return null;
}
