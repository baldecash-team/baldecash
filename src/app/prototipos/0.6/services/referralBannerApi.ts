/**
 * Banner de referido — resuelve quién trajo la visita.
 *
 * Se llama desde el server component de la landing. Hay DOS formas de llegar,
 * segun con qué parametro venga el link:
 *
 *   ?promotor={code}  →  ws2, con el token de `utm_term` como verificacion
 *   ?ref={codigo}     →  el hub de activaciones, que emitio ese link corto
 *
 * `promotor` es el `Promoter.code` de ws2, y sólo viaja cuando la promotora
 * tiene su correspondencia cargada allá. `ref` viaja SIEMPRE —lo estampa
 * `/r/{codigo}` del hub al redirigir— así que es el único identificador con el
 * que se puede contar en un flyer. Por eso los dos caminos, y no uno.
 *
 * El dato de `promotor` vive en la Postgres analítica (`acthub_persona`, el
 * espejo de Airtable del hub de activaciones) y lo expone ws2:
 *
 *     GET /public/referido/promotor?promotor={code}&utm_term={utm_term}
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
  /** `Promoter.code`; viaja como propiedad del evento, no se muestra. */
  promoterCode: string | null;
  /** `ok` o `sin_telefono`: las dos formas en que la franja se muestra. */
  reason: string;
}

interface ReferralBannerApiResponse {
  show: boolean;
  reason: string;
  promoter_code: string | null;
  first_name: string | null;
  phone_display: string | null;
  whatsapp_url: string | null;
}

/**
 * Devuelve los datos de la franja, o `null` si no hay que renderizarla.
 *
 * `null` cubre todos los casos negativos sin distinguirlos: sin `promotor` en la
 * URL, código que no existe, promotora dada de baja, token que no coincide, o el
 * API caído. Ninguno muestra un placeholder — nunca "Referido por —".
 */
export async function fetchReferralBanner(
  promotor: string | null | undefined,
  utmTerm: string | null | undefined,
): Promise<ReferralBanner | null> {
  if (!promotor) return null;

  // Sin el token del `utm_term` el endpoint responde `show: false` sin tocar la
  // base; se corta acá igual para no gastar ni el round-trip.
  if (!utmTerm || !utmTerm.includes('promo_')) return null;

  const url =
    `${API_BASE_URL}/public/referido/promotor` +
    `?promotor=${encodeURIComponent(promotor)}` +
    `&utm_term=${encodeURIComponent(utmTerm)}`;

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
      promoterCode: data.promoter_code ?? null,
      reason: data.reason,
    };
  } catch (error) {
    // Log y seguir: la landing tiene que cargar igual. Un `throw` acá se
    // convierte en la pantalla de error de Next para toda la página.
    console.error('[referral-banner] no se pudo resolver el promotor:', error);
    return null;
  }
}

/**
 * Base del hub de activaciones (`promotores.baldecash.com`), que es OTRO sitio:
 * el `ref` lo emite él y sólo él sabe a quién corresponde.
 */
const PROMOTORES_BASE_URL =
  process.env.NEXT_PUBLIC_PROMOTORES_URL || 'https://promotores.baldecash.com';

/**
 * Presupuesto propio, más ancho que el de ws2. Medido contra producción, la
 * latencia del hub es bimodal: ~0,3 s cuando el CDN responde (`X-Vercel-Cache:
 * HIT`) y ~3,3 s cuando toca levantar la lambda. Los 2 s de `TIMEOUT_MS` caen
 * justo en el hueco entre las dos, así que descartaban TODOS los misses — que
 * son precisamente los primeros escaneos de un QR nuevo.
 *
 * El costo de este número lo paga como mucho una visita por código y por hora:
 * el `revalidate` de abajo sirve a las demás desde la caché de datos de Next, y
 * un fallo no la envenena (se devuelve null sin cachear, y la siguiente visita
 * reintenta). Preferimos un TTFB peor para esa visita que una franja que no
 * aparece durante toda la hora.
 */
const TIMEOUT_REF_MS = 4000;

/**
 * Forma del código de referido del hub: 6 caracteres de un alfabeto sin 0/O/1/l/i.
 *
 * Se valida acá por lo mismo que del otro lado: `ref` llega de la calle —de un QR
 * mal leído, de un link recortado, de una URL entera pegada en el parámetro— y no
 * tiene sentido gastar un round-trip en el render de la landing para algo que no
 * puede existir. Acepta mayúsculas: ese código sí existe, y rechazarlo por la caja
 * sería perder la franja por nada.
 */
const RE_REF = /^[23456789abcdefghjkmnpqrstuvwxyz]{6}$/;

interface PromotorPublicoResponse {
  ok: boolean;
  codigo?: string;
  promotor?: { nombre?: string | null };
  activacion_activa?: boolean;
}

/**
 * Resuelve la franja a partir del `ref` que estampa `/r/{codigo}` del hub.
 *
 * Devuelve una franja SIN teléfono: el endpoint público del hub expone solo el
 * primer nombre, a propósito —es una ruta abierta cuya llave es un código de 6
 * caracteres tipeable—. `ReferralBanner` ya contempla ese caso y pinta "Haz sido
 * referido por Aned." sin el chip de WhatsApp, que es mejor que un `wa.me` sin
 * destinatario.
 *
 * Mismas tres reglas que `fetchReferralBanner`: corre server-side, se cachea una
 * hora, y ante cualquier problema devuelve `null` en vez de lanzar.
 */
export async function fetchReferralBannerByRef(
  ref: string | null | undefined,
): Promise<ReferralBanner | null> {
  const codigo = ref?.trim().toLowerCase();
  if (!codigo || !RE_REF.test(codigo)) return null;

  const url = `${PROMOTORES_BASE_URL}/api/publico/referido/${encodeURIComponent(codigo)}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ['referral-banner'] },
      signal: AbortSignal.timeout(TIMEOUT_REF_MS),
    });
    if (!response.ok) return null;

    const data = (await response.json()) as PromotorPublicoResponse;
    const firstName = data?.promotor?.nombre?.trim();
    if (!data?.ok || !firstName) return null;

    return {
      firstName,
      phoneDisplay: null,
      whatsappUrl: null,
      // El `ref` ocupa el lugar del `Promoter.code`: no se muestra, viaja como
      // propiedad del evento y es la clave con la que el banner recuerda que lo
      // descartaron. Dos promotoras distintas nunca comparten código.
      promoterCode: codigo,
      reason: 'ref',
    };
  } catch (error) {
    console.error('[referral-banner] no se pudo resolver el ref:', error);
    return null;
  }
}
