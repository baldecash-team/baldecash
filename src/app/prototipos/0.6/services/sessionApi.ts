/**
 * Atributos de la sesión que se conocen DESPUÉS de crearla.
 *
 * La variante del test A/B se sortea al abrir accesorios y el DNI aparece
 * cuando la persona se identifica en el formulario — los dos bastante después
 * del `POST /tracking/session`. Hasta ahora no había por dónde mandarlos, así
 * que la variante vivía solo dentro del payload de un evento (sin forma de
 * cruzarla con el resultado de la sesión, que es lo único que permite leer un
 * test A/B) y `session.dni` quedaba vacío incluso en sesiones que terminaban
 * en solicitud.
 *
 * El endpoint del backend solo rellena huecos: nunca pisa un valor ya puesto.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

export interface SessionPatchFields {
  ab_accessories_variant?: string | null;
  dni?: string | null;
  fingerprint_hash?: string | null;
  user_agent?: string | null;
  entry_url?: string | null;
}

/**
 * Campos ya enviados en esta carga de página, como `uuid:campo=valor`.
 *
 * Los call sites viven dentro de efectos y handlers que se repiten (el A/B se
 * relee en cada refresco de accesorios, el chequeo de documento corre en cada
 * tecleo válido). Sin esto, un dato que no cambia generaría una request por
 * render.
 */
const enviados = new Set<string>();

/** Solo para tests: limpia la memoria de deduplicación. */
export function __resetPatchDedupe(): void {
  enviados.clear();
}

/**
 * Completa atributos de la sesión. Fire-and-forget: nunca lanza.
 *
 * Si la request falla, el campo NO queda marcado como enviado, así que el
 * siguiente intento vuelve a probar. Es deliberado: el dato importa más que
 * ahorrar una request.
 */
export async function patchTrackingSession(
  sessionUuid: string | null | undefined,
  fields: SessionPatchFields
): Promise<void> {
  if (!sessionUuid) return;

  const pendientes: Record<string, string> = {};
  for (const [campo, valor] of Object.entries(fields)) {
    if (!valor) continue;
    const clave = `${sessionUuid}:${campo}=${valor}`;
    if (enviados.has(clave)) continue;
    pendientes[campo] = valor;
  }

  if (Object.keys(pendientes).length === 0) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/public/tracking/session/${sessionUuid}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendientes),
      }
    );

    if (!response.ok) return;

    for (const [campo, valor] of Object.entries(pendientes)) {
      enviados.add(`${sessionUuid}:${campo}=${valor}`);
    }
  } catch {
    // Nunca romper el flujo del usuario por un dato de analítica.
  }
}
