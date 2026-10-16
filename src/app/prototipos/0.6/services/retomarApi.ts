/**
 * Campaña decil 9 — cliente del API público de ws2 (`/public/retomar/{token}`).
 *
 * El token del botón del WhatsApp ES la credencial. Fail-safe como el resto de
 * `services/`: nunca lanza; los errores vuelven como `{ reason }`.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export interface RetomarDecision {
  /** `accepted` | `declined` | `received` (la reversión falló; se revisa a mano). */
  status: string;
  /** El link ya se había usado: es la misma respuesta de antes. */
  ya_decidido?: boolean;
}

export interface RetomarError {
  /** `invalid` | `network` | `unknown` */
  reason: string;
}

export function isRetomarError(x: unknown): x is RetomarError {
  return typeof x === 'object' && x !== null && typeof (x as RetomarError).reason === 'string';
}

/** Registra el «Sí» o el «No». Idempotente del lado del backend. */
export async function decidirRetomar(
  token: string,
  acepta: boolean,
): Promise<RetomarDecision | RetomarError> {
  try {
    const r = await fetch(`${API_BASE_URL}/public/retomar/${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acepta }),
      cache: 'no-store',
    });
    if (r.status === 404) return { reason: 'invalid' };
    if (!r.ok) return { reason: 'unknown' };
    return (await r.json()) as RetomarDecision;
  } catch {
    return { reason: 'network' };
  }
}
