/**
 * Elección de la unidad física — cliente HTTP de `/public/eleccion-equipo`.
 *
 * Mismo contrato de seguridad que `entregaApi`: el token de la URL es la ÚNICA
 * prueba de titularidad. El `application_code` nunca viaja, ni en la URL ni en
 * el body.
 *
 * El backend NO manda el serial de la unidad a propósito (es dato de
 * inventario y esta es una página pública): el cliente ve `display_number`, un
 * correlativo 1..N que el backend fija la primera vez y persiste. Nada de este
 * módulo debe derivar ni inventar un serial.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export interface EleccionFoto {
  url: string;
  /**
   * NO es la parte del equipo que muestra la foto: es el nombre del
   * dispositivo de la estación de inspección que la tomó (p. ej. "celular
   * pamela" — el celular de una persona del equipo de trabajo). Dato interno,
   * nunca se muestra en pantalla ni viaja en analítica. El backend va a dejar
   * de mandarlo; tratarlo como opcional y no usarlo para nada visible.
   */
  label?: string | null;
}

export interface EleccionUnidad {
  unit_id: number;
  /** Correlativo que ve el cliente (1, 2, 3...). NUNCA el serial. */
  display_number: number | null;
  grado: string | null;
  grado_label: string | null;
  photos: EleccionFoto[];
  video_url: string | null;
}

export interface EleccionProducto {
  product_id?: number;
  sku?: string | null;
  name?: string | null;
  slug?: string | null;
}

export interface EleccionDatos {
  application: {
    /** Cuota mensual aprobada. Puede llegar como número o como string decimal. */
    monthly_payment: number | string | null;
    /** Vencimiento del link. Naive en hora Lima (ver `formato.ts`). */
    link_expires_at: string | null;
  };
  product: EleccionProducto;
  units: EleccionUnidad[];
  /** `null` mientras no haya elegido; el `unit_id` reservado si ya eligió. */
  selected_unit_id: number | null;
}

export interface EleccionSeleccion {
  status: 'selected';
  unit: EleccionUnidad;
}

export interface EleccionApiError {
  error: string;
  reason: string;
}

export function isEleccionApiError(x: unknown): x is EleccionApiError {
  return typeof x === 'object' && x !== null && 'reason' in x;
}

/** Extrae `{reason, message}` del `detail` del backend. */
async function toError(response: Response): Promise<EleccionApiError> {
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

/** Canjea el token y devuelve las unidades que el cliente puede elegir. */
export async function getEleccion(token: string): Promise<EleccionDatos | EleccionApiError> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/eleccion-equipo/${token}`);
    if (!response.ok) return await toError(response);
    const datos = (await response.json()) as EleccionDatos;
    // `units` es la única lista que la pantalla recorre sin preguntar. Si el
    // backend alguna vez la omite, sin este default la página queda en blanco
    // y sin error visible; con él cae en "estamos preparando tu equipo", que es
    // exactamente lo que significa no tener unidades.
    return { ...datos, units: datos.units ?? [] };
  } catch {
    // Se distingue de un rechazo del backend: acá reintentar sirve.
    return { reason: 'network', error: 'No pudimos conectarnos. Revisa tu conexión.' };
  }
}

/**
 * Reserva la unidad elegida.
 *
 * El 409 `unit_unavailable` es un desenlace ESPERADO, no una falla: alguien se
 * llevó esa unidad primero. Llega como `EleccionApiError` con ese `reason` para
 * que la pantalla refresque la lista en vez de tratarlo como error de sistema.
 */
export async function elegirUnidad(
  token: string,
  unitId: number,
): Promise<EleccionSeleccion | EleccionApiError> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/eleccion-equipo/${token}/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unit_id: unitId }),
    });
    if (!response.ok) return await toError(response);
    return (await response.json()) as EleccionSeleccion;
  } catch {
    return { reason: 'network', error: 'No pudimos conectarnos. Revisa tu conexión.' };
  }
}
