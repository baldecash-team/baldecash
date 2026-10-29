/**
 * Diseño de la solicitud de la sesión — `GET /public/landing/{slug}/diseno`
 * (BAL-5296).
 *
 * ws2 asigna el formulario de la sesión si todavía no tiene (mismo sorteo y
 * reparto que el wizard) y devuelve el diseño de ese formulario. Se llama al
 * apretar «Lo quiero» solo en landings con `features.diseno_por_formulario`.
 *
 * Nunca rompe la web: ante error, respuesta rara o más de 2,5 s, devuelve
 * `null` y quien llama usa el diseño de la landing (lo de hoy).
 */
import * as Sentry from '@sentry/nextjs';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

/** Tiempo máximo que el botón «Lo quiero» espera al backend. */
export const DISENO_TIMEOUT_MS = 2500;

export interface DisenoDeLaSesion {
  formId: number | null;
  disenoSolicitud: 1 | 2;
}

export async function pedirDisenoDeLaSesion(
  slug: string,
  sessionUuid: string,
  productId?: number,
): Promise<DisenoDeLaSesion | null> {
  const params = new URLSearchParams({ session_uuid: sessionUuid });
  if (productId != null) params.set('product_id', String(productId));
  const url = `${API_BASE_URL}/public/landing/${encodeURIComponent(slug)}/diseno?${params.toString()}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DISENO_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`diseno: HTTP ${res.status}`);
    const json = await res.json();
    const body = json && typeof json === 'object' && 'data' in json && json.data ? json.data : json;
    const d = body?.solicitud_design;
    if (d !== 1 && d !== 2) throw new Error('diseno: respuesta sin solicitud_design válido');
    const formId = typeof body.form_id === 'number' ? body.form_id : null;
    return { formId, disenoSolicitud: d };
  } catch (error) {
    // Sin datos personales: ni el session_uuid ni el producto viajan.
    Sentry.captureException(error, { tags: { landing: slug, origen: 'diseno_por_formulario' } });
    return null;
  } finally {
    clearTimeout(timer);
  }
}
