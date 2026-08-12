/**
 * Formulario de entrega a domicilio — cliente HTTP.
 *
 * El token de la URL es la ÚNICA prueba de titularidad de este flujo: el
 * `application_code` nunca viaja, ni en la URL ni en el body. Son secuenciales,
 * así que una URL adivinable expondría la entrega de otra persona.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export interface EntregaDireccion {
  direccion: string | null;
  calle: string | null;
  referencia: string | null;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
}

export interface EntregaDatos {
  application_code: string;
  /** Fecha en que BaldeCash envía el equipo (YYYY-MM-DD). La define BaldeCash. */
  fecha_entrega: string | null;
  equipo: { nombre: string | null; sku: string | null };
  /** Precargada desde lo que la persona declaró al postular, para corregir. */
  direccion: EntregaDireccion;
  titular: { nombre: string | null; documento: string | null };
}

export interface EntregaPayload {
  direccion: string;
  calle: string;
  referencia: string;
  departamento: string;
  provincia: string;
  distrito: string;
  es_titular: boolean;
  nombres: string;
  nrodocumento: string;
  telefono: string;
  parentesco: string;
}

export interface EntregaApiError {
  error: string;
  reason: string;
}

export function isEntregaApiError(x: unknown): x is EntregaApiError {
  return typeof x === 'object' && x !== null && 'reason' in x;
}

/** Extrae `{reason, message}` del `detail` del backend. */
async function toError(response: Response): Promise<EntregaApiError> {
  try {
    const data = await response.json();
    const d = data?.detail;
    // FastAPI devuelve los errores de validación de Pydantic como un ARRAY de
    // `{loc, msg, type}`, no como el `{reason, message}` propio del dominio.
    // Sin esta rama caerían en `typeof d === 'object'` (los arrays lo son) y
    // saldrían como `unknown`, indistinguibles de un 500.
    if (Array.isArray(d)) {
      return { reason: 'validation_error', error: 'Revisa los datos e intenta nuevamente.' };
    }
    if (d && typeof d === 'object') {
      return { reason: d.reason || 'unknown', error: d.message || 'Ocurrió un error.' };
    }
    return { reason: 'unknown', error: typeof d === 'string' ? d : 'Ocurrió un error.' };
  } catch {
    return { reason: 'unknown', error: 'Ocurrió un error.' };
  }
}

/** Canjea el token y devuelve lo que el formulario muestra. */
export async function getEntrega(token: string): Promise<EntregaDatos | EntregaApiError> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/entrega/${token}`);
    if (!response.ok) return await toError(response);
    return (await response.json()) as EntregaDatos;
  } catch {
    // Se distingue de un rechazo del backend: acá reintentar sirve.
    return { reason: 'network', error: 'No pudimos conectarnos. Revisa tu conexión.' };
  }
}

/** Registra la coordinación. El backend la encola hacia el sistema de despacho. */
export async function registrarEntrega(
  token: string,
  payload: EntregaPayload,
): Promise<{ ok: true } | EntregaApiError> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/entrega/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return await toError(response);
    return { ok: true };
  } catch {
    return { reason: 'network', error: 'No pudimos conectarnos. Revisa tu conexión.' };
  }
}
