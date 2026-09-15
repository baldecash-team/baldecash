/**
 * Encuesta de experiencia post-entrega — cliente del API público de ws2.
 *
 * El token del link de WhatsApp ES la credencial: nunca viaja un
 * `application_code` (es secuencial y adivinable). Fail-safe como el resto de
 * `services/`: ninguna función lanza; los errores vuelven como
 * `{ reason, error }` y el componente decide la pantalla.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export interface EncuestaInfo {
  /** Fecha de la solicitud, `YYYY-MM-DD`. Puede faltar. */
  application_date?: string | null;
  /** Nombre de pila de la analista que evaluó. `null` = aprobación automática. */
  analyst_name?: string | null;
  /** Ya fue respondida: se muestra la pantalla de gracias sin formulario. */
  answered: boolean;
  first_name?: string | null;
}

export interface EncuestaRespuesta {
  nps: number;
  nps_reason?: string;
  ces: number;
  sat_web: number;
  /** Solo cuando la encuesta trae `analyst_name`. */
  sat_analyst?: number;
  sat_delivery: number;
  comment?: string;
}

export interface EncuestaApiError {
  /** `invalid` | `answered` | `validation` | `network` | `unknown` */
  reason: string;
  error: string;
}

export function isEncuestaApiError(x: unknown): x is EncuestaApiError {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as EncuestaApiError).reason === 'string' &&
    typeof (x as EncuestaApiError).error === 'string'
  );
}

async function toError(response: Response): Promise<EncuestaApiError> {
  try {
    const data = await response.json();
    const d = data?.detail;
    // 422 de Pydantic: array de `{loc, msg, type}`, no el `{reason, message}` propio.
    if (Array.isArray(d)) {
      return { reason: 'validation', error: 'Revisa tus respuestas e intenta nuevamente.' };
    }
    if (d && typeof d === 'object') {
      return { reason: d.reason ?? 'unknown', error: d.message ?? 'Ocurrió un error.' };
    }
  } catch {
    /* noop */
  }
  if (response.status === 404) {
    return { reason: 'invalid', error: 'Este enlace no es válido.' };
  }
  return { reason: 'unknown', error: 'Ocurrió un error. Intenta nuevamente.' };
}

const NETWORK: EncuestaApiError = {
  reason: 'network',
  error: 'Error de conexión. Intenta nuevamente.',
};

/** Datos para pintar la encuesta (fecha, analista, si ya se respondió). */
export async function getEncuesta(token: string): Promise<EncuestaInfo | EncuestaApiError> {
  try {
    const r = await fetch(`${API_BASE_URL}/public/encuesta/${encodeURIComponent(token)}`, {
      cache: 'no-store',
    });
    if (!r.ok) return await toError(r);
    return (await r.json()) as EncuestaInfo;
  } catch {
    return NETWORK;
  }
}

/** Cualquier subconjunto de la respuesta: lo que el cliente ya marcó. */
export type EncuestaParcial = Partial<EncuestaRespuesta>;

/**
 * Guarda el progreso parcial (una respuesta a la vez, a medida que el cliente
 * marca) para que en admin2 se vean las sesiones incompletas con lo que
 * alcanzó a contestar. No cierra la encuesta: el `POST` final sigue igual.
 *
 * Fire-and-forget: nunca lanza ni bloquea la UI; devuelve `false` si el
 * servidor rechazó o no hubo red. `keepalive` para que el último PATCH
 * sobreviva si el cliente cierra la pestaña justo después de marcar.
 */
export async function guardarProgresoEncuesta(
  token: string,
  parcial: EncuestaParcial,
): Promise<boolean> {
  try {
    const r = await fetch(`${API_BASE_URL}/public/encuesta/${encodeURIComponent(token)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parcial),
      keepalive: true,
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** Envía las respuestas. `{ ok: true }` o el error de dominio. */
export async function responderEncuesta(
  token: string,
  respuesta: EncuestaRespuesta,
): Promise<{ ok: true } | EncuestaApiError> {
  try {
    const r = await fetch(`${API_BASE_URL}/public/encuesta/${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(respuesta),
    });
    if (!r.ok) return await toError(r);
    return { ok: true };
  } catch {
    return NETWORK;
  }
}
