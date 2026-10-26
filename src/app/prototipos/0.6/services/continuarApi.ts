/**
 * Botón Sí/No del WhatsApp "¿seguimos con tu solicitud?" — cliente del API
 * público de ws2 (`/public/continuar/{token}`).
 *
 * El token del botón del WhatsApp ES la credencial. Fail-safe como el resto de
 * `services/`: nunca lanza; los errores vuelven como `{ reason }`.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export interface ContinuarDecision {
  /** `received` (la decisión quedó registrada) | `closed` (la solicitud ya estaba cerrada). */
  status: string;
  /** `si` | `no` — sólo viene con `status: "received"`. */
  respuesta?: string;
}

export interface ContinuarDatos {
  nombre?: string;
  equipo?: string;
  /** `evaluacion` | `firma` */
  variante?: string;
  estado?: string;
  link_firma?: string;
}

export interface ContinuarError {
  /** `invalid` | `network` | `unknown` */
  reason: string;
}

export function isContinuarError(x: unknown): x is ContinuarError {
  return typeof x === 'object' && x !== null && typeof (x as ContinuarError).reason === 'string';
}

/** Registra el «Sí» o el «No». Idempotente del lado del backend. */
export async function decidirContinuar(
  token: string,
  acepta: boolean,
): Promise<ContinuarDecision | ContinuarError> {
  try {
    const r = await fetch(`${API_BASE_URL}/public/continuar/${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acepta }),
      cache: 'no-store',
    });
    if (r.status === 404) return { reason: 'invalid' };
    if (!r.ok) return { reason: 'unknown' };
    return (await r.json()) as ContinuarDecision;
  } catch {
    return { reason: 'network' };
  }
}

/**
 * Detalle para personalizar el mensaje (nombre, equipo, variante y, si aplica,
 * el link de firma). Se pide después del POST; si falla, el cliente cae al
 * texto genérico sin nombre.
 */
export async function datosContinuar(token: string): Promise<ContinuarDatos | ContinuarError> {
  try {
    const r = await fetch(`${API_BASE_URL}/public/continuar/${encodeURIComponent(token)}`, {
      method: 'GET',
      cache: 'no-store',
    });
    if (r.status === 404) return { reason: 'invalid' };
    if (!r.ok) return { reason: 'unknown' };
    return (await r.json()) as ContinuarDatos;
  } catch {
    return { reason: 'network' };
  }
}
