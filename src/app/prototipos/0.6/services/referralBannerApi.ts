/**
 * Banner de referido — resuelve quién trajo la visita.
 *
 * Se llama desde el server component de la landing cuando la URL trae un
 * `utm_term` con `__promo_`. El dato vive en la Postgres analítica
 * (`acthub_persona`, el espejo de Airtable del hub de activaciones) y lo
 * expone ws2:
 *
 *     GET /public/referido/promotor?utm_term={utm_term}
 *
 * La llave es el `__promo_{token}` del `utm_term`, NO el `promotor={code}`:
 * `ws2_promotor_code` está vacía en las 271 filas de `acthub_persona`, así que
 * el hub omite ese parámetro y usarlo de llave dejaría el banner mudo. El token
 * en cambio viaja en los 95 links cortos ya emitidos, así que la franja
 * funciona en los QR ya impresos sin regenerar nada.
 *
 * Tres decisiones que no son negociables acá:
 *
 * 1. Corre server-side. El teléfono no debe pedirse desde el navegador después
 *    de pintar: el banner apareciendo a los 300 ms mueve el layout y desplaza
 *    el CTA justo cuando el usuario va a tocarlo.
 * 2. Se cachea una hora. El dato cambia con la frecuencia con la que se edita
 *    un teléfono en Airtable, o sea casi nunca; el costo de un teléfono viejo
 *    por una hora es cero y el de una consulta por pageview no.
 * 3. Un fallo devuelve `null`, nunca lanza. Si el API no responde, la landing
 *    carga sin franja. Nunca al revés — el banner es decorativo y la landing no.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.baldecash.com/api/v1';

/** Una hora, igual que el `s-maxage` que declara el endpoint. */
const REVALIDATE_SECONDS = 3600;

/**
 * Presupuesto propio y corto. El default del fetch de Node no tiene techo:
 * sin esto, un Aurora lento se traduce en una landing que no responde.
 */
const TIMEOUT_MS = 2000;

export interface ReferralBanner {
  /** Primer nombre de la promotora, ya capitalizado: "Marco". */
  firstName: string;
  /** Número tal como se pinta: "999 888 777". `null` si no hay teléfono usable. */
  phoneDisplay: string | null;
  /** Link `wa.me` con el mensaje precargado. `null` ⇒ franja sin botón. */
  whatsappUrl: string | null;
  /** El `__promo_{token}` del `utm_term`; agrupa el evento sin decir quién es. */
  promoterToken: string;
  /** `ok` o `sin_telefono`: las dos formas en que la franja se muestra. */
  reason: string;
}

interface ReferralBannerApiResponse {
  show: boolean;
  reason: string;
  first_name: string | null;
  phone_display: string | null;
  whatsapp_url: string | null;
}

/** El `{token}` de `__promo_{token}`, que es la llave. */
export function extraerTokenPromo(utmTerm: string | null | undefined): string | null {
  if (!utmTerm) return null;
  return /__promo_([a-z0-9]+)/.exec(utmTerm)?.[1] ?? null;
}

/**
 * Devuelve los datos de la franja, o `null` si no hay que renderizarla.
 *
 * `null` cubre todos los casos negativos sin distinguirlos: sin `utm_term`, sin
 * `__promo_`, token que no matchea a nadie, promotora dada de baja, o el API
 * caído. Ninguno muestra un placeholder — nunca "Referido por —".
 */
export async function fetchReferralBanner(
  utmTerm: string | null | undefined,
): Promise<ReferralBanner | null> {
  // Sin el token el endpoint responde `show: false` sin tocar la base; se corta
  // acá igual para no gastar ni el round-trip. Es la mayoría del tráfico.
  const token = extraerTokenPromo(utmTerm);
  if (!token) return null;

  const url =
    `${API_BASE_URL}/public/referido/promotor` +
    `?utm_term=${encodeURIComponent(utmTerm as string)}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ['referral-banner'] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;

    const data = (await response.json()) as ReferralBannerApiResponse;
    if (!data?.show || !data.first_name) return null;

    return {
      firstName: data.first_name,
      phoneDisplay: data.phone_display ?? null,
      whatsappUrl: data.whatsapp_url ?? null,
      promoterToken: token,
      reason: data.reason,
    };
  } catch (error) {
    // Log y seguir: la landing tiene que cargar igual. Un `throw` acá se
    // convierte en la pantalla de error de Next para toda la página.
    console.error('[referral-banner] no se pudo resolver el promotor:', error);
    return null;
  }
}
