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
 * 1. En la LANDING corre server-side. Ahí el banner apareciendo a los 300 ms
 *    mueve el layout y desplaza el CTA justo cuando el usuario va a tocarlo.
 *
 *    `fetchReferralBannerByRef` sí se llama desde el navegador en el resto del
 *    recorrido (`ReferralBannerGate`), y no es una excepción a la regla sino el
 *    mismo criterio: en el catálogo, el detalle y el wizard no hay nada arriba
 *    de la franja que se pueda desplazar, y esas páginas ya montan su contenido
 *    en el cliente. El endpoint del hub está hecho para eso —tiene CORS con
 *    allowlist justamente para que la landing lo llame desde el navegador—.
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

/**
 * El mensaje con el que se abre WhatsApp.
 *
 * Vive acá, y no en cada backend, porque los dos caminos tienen que abrir la
 * MISMA conversación: ws2 arma su propio `text` ("vi el flyer de BaldeCash y
 * tengo una consulta") y el hub no arma ninguno. Con el copy repartido en tres
 * repos, cambiarlo significaba tres deploys coordinados para que un usuario no
 * viera un texto distinto según por qué parámetro entró.
 *
 * El `text` importa más de lo que parece: sin él la promotora recibe un "Hola"
 * suelto y no sabe de qué activación viene, ni de qué producto le hablan.
 */
export function mensajeWhatsApp(firstName: string | null | undefined): string {
  const nombre = firstName?.trim();
  return nombre
    ? `Hola ${nombre}, tengo dudas sobre el financiamiento de equipos de BaldeCash`
    : 'Hola, tengo dudas sobre el financiamiento de equipos de BaldeCash';
}

/**
 * Forma de un destinatario de `wa.me`: sólo dígitos, con país.
 *
 * El hub ya normaliza, pero esto llega de otro dominio y termina en un `href`.
 * Un valor con cualquier otra cosa adentro no se usa: preferimos la franja sin
 * link antes que un link a un número inventado.
 */
const RE_WHATSAPP = /^[0-9]{9,15}$/;

/** `wa.me` a un número ya normalizado (`51987654321`), con el mensaje precargado. */
function urlWhatsApp(numero: string, firstName: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensajeWhatsApp(firstName))}`;
}

/**
 * El número que ws2 ya validó, sacado de su propio link.
 *
 * Se toma de ahí y no de `phone_display` a propósito: ws2 conoce los fijos, los
 * extranjeros y los que ya vienen con país, y volver a derivar el número desde
 * el string que se pinta sería una segunda normalización que puede discrepar de
 * la suya. Lo único que no queremos de ws2 es el copy.
 *
 * Contempla las dos formas de link de WhatsApp por si esa punta cambia de
 * opinión: `wa.me/{numero}` (la que arma hoy) y `api.whatsapp.com/send?phone=`.
 */
function numeroDeUrlWhatsApp(waUrl: string | null): string | null {
  if (!waUrl) return null;
  try {
    const url = new URL(waUrl);
    const candidato = url.searchParams.get('phone') ?? url.pathname.replace(/\//g, '');
    return RE_WHATSAPP.test(candidato) ? candidato : null;
  } catch {
    // No parsea: `safeExternalUrl` la iba a descartar igual del otro lado.
    return null;
  }
}

/**
 * El link de ws2 con NUESTRO mensaje encima.
 *
 * Se rearma entero en vez de sólo reescribirle el `text` porque
 * `URLSearchParams` serializa los espacios como `+` y el camino del hub los
 * manda como `%20`. Las dos formas funcionan en WhatsApp, pero producirlas
 * distinto según por qué parámetro entró el usuario es una diferencia que no
 * significa nada y que se convierte en ruido apenas alguien compare los links en
 * el dato o en un log.
 */
function conNuestroMensaje(waUrl: string | null, firstName: string): string | null {
  const numero = numeroDeUrlWhatsApp(waUrl);
  return numero ? urlWhatsApp(numero, firstName) : null;
}

export interface ReferralBanner {
  /** Primer nombre de la promotora, ya capitalizado: "Marco". */
  firstName: string;
  /**
   * Link `wa.me` con el mensaje precargado. `null` ⇒ la franja se pinta igual,
   * pero no es clickeable: un `wa.me` sin destinatario abre WhatsApp en blanco.
   */
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
      whatsappUrl: conNuestroMensaje(data.whatsapp_url ?? null, data.first_name),
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
  promotor?: {
    nombre?: string | null;
    /**
     * Ya normalizado y listo para `wa.me` (`51987654321`). Viene AUSENTE —no en
     * null— cuando el registro no tiene un número usable; el hub lo omite a
     * propósito para que la ausencia sea el caso, no un valor.
     */
    whatsapp?: string | null;
  };
  activacion_activa?: boolean;
}


/**
 * Resuelve la franja a partir del `ref` que estampa `/r/{codigo}` del hub.
 *
 * Desde `feat/referido-publico-whatsapp` en el hub, el endpoint devuelve también
 * el celular ya normalizado, así que este camino arma la franja completa —con
 * link— igual que el de ws2. Es el que importa: `ref` viaja en TODOS los links
 * del hub y `promotor` sólo en los de quien tiene correspondencia en ws2.
 *
 * Cuando el registro no tiene un número usable el campo viene ausente y la
 * franja sale sin link. `ReferralBanner` ya contempla ese caso: mejor un aviso
 * que no lleva a ningún lado que un `wa.me` sin destinatario, que abre WhatsApp
 * en blanco.
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

    const numero = data.promotor?.whatsapp?.trim();
    const whatsappUrl =
      numero && RE_WHATSAPP.test(numero) ? urlWhatsApp(numero, firstName) : null;

    return {
      firstName,
      whatsappUrl,
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
