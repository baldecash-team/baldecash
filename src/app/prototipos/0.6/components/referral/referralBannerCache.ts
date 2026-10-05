/**
 * La franja resuelta, guardada para el resto del recorrido.
 *
 * La franja se resuelve server-side en la landing, que es la única página a la
 * que apunta el link del flyer y la única que tiene el `?promotor=` / `?ref=` en
 * la URL. De ahí en adelante el querystring se pierde —`routes.catalogo()` arma
 * una URL limpia— así que el catálogo, el detalle y el wizard no tienen con qué
 * volver a resolverla.
 *
 * Guardar el resultado es lo que hace que la franja siga apareciendo en todo el
 * recorrido sin pagar un fetch por página. El respaldo, cuando no hay nada
 * guardado, es el `ref` de `landingParams`, que sí sobrevive en localStorage
 * (ver `ReferralBannerGate`).
 *
 * ── POR QUÉ `sessionStorage` Y NO `localStorage` ──
 *
 * El `ref` dura porque es atribución: quien llegó por el flyer de alguien sigue
 * siendo su referido aunque vuelva mañana. Esto es otra cosa: es un nombre y un
 * celular ya resueltos, y esos sí cambian —una promotora se da de baja, edita su
 * número en Airtable—. Que caduque con la pestaña obliga a re-resolverlo contra
 * el hub en la próxima visita, que es exactamente lo que queremos.
 *
 * ── POR QUÉ ES UN STORE Y NO DOS FUNCIONES SUELTAS ──
 *
 * `sessionStorage` es un sistema externo a React, así que se lee con
 * `useSyncExternalStore` y no con `useState` + `useEffect`. Además de ser lo que
 * corresponde, evita el render en cascada: el valor entra durante la hidratación
 * y no en un efecto posterior, y la franja no aparece de golpe empujando la
 * página cuando el usuario ya estaba por tocar algo.
 *
 * El emisor existe porque el evento `storage` del navegador NO se dispara en la
 * pestaña que escribe: sin él, resolver por `ref` no repintaría nada.
 */

import type { ReferralBanner } from '../../services/referralBannerApi';

const clave = (landingSlug: string) => `baldecash-referral-banner-${landingSlug}`;

const suscriptores = new Set<() => void>();

/**
 * Lo último leído por landing, para devolver SIEMPRE la misma referencia
 * mientras el string guardado no cambie.
 *
 * No es una optimización: `useSyncExternalStore` compara por identidad y entra
 * en un bucle infinito si el snapshot devuelve un objeto nuevo cada vez. Por eso
 * se memoriza contra el crudo, que es el único que cambia de verdad.
 */
const memo = new Map<string, { crudo: string | null; valor: ReferralBanner | null }>();

export function suscribirFranja(cb: () => void): () => void {
  suscriptores.add(cb);
  return () => {
    suscriptores.delete(cb);
  };
}

/**
 * Valida la forma antes de devolverla: lo que hay en storage lo pudo escribir
 * una versión anterior del código o el propio usuario desde la consola, y de acá
 * sale una URL que termina en un `href`.
 */
function parsear(crudo: string): ReferralBanner | null {
  try {
    const data = JSON.parse(crudo) as Partial<ReferralBanner>;
    if (typeof data?.firstName !== 'string' || !data.firstName) return null;
    return {
      firstName: data.firstName,
      // `safeExternalUrl` corre igual del otro lado, pero un `whatsappUrl` que
      // no sea string ni null rompería el tipo antes de llegar allá.
      whatsappUrl: typeof data.whatsappUrl === 'string' ? data.whatsappUrl : null,
      promoterCode: typeof data.promoterCode === 'string' ? data.promoterCode : null,
      reason: typeof data.reason === 'string' ? data.reason : 'guardado',
    };
  } catch {
    // JSON corrupto: sin franja y a otra cosa. No puede tumbar la página.
    return null;
  }
}

/** Snapshot para `useSyncExternalStore`. Estable mientras el guardado no cambie. */
export function leerFranjaGuardada(landingSlug: string): ReferralBanner | null {
  if (typeof window === 'undefined') return null;

  let crudo: string | null = null;
  try {
    crudo = window.sessionStorage.getItem(clave(landingSlug));
  } catch {
    // sessionStorage tira en algunos WebView y en el modo privado de WebKit.
    crudo = null;
  }

  const anterior = memo.get(landingSlug);
  if (anterior && anterior.crudo === crudo) return anterior.valor;

  const valor = crudo ? parsear(crudo) : null;
  memo.set(landingSlug, { crudo, valor });
  return valor;
}

export function guardarFranja(landingSlug: string, data: ReferralBanner): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(clave(landingSlug), JSON.stringify(data));
  } catch {
    // Sin storage la franja vive sólo en la página donde se resolvió. El
    // respaldo por `ref` la recupera en la siguiente.
  }
  suscriptores.forEach((cb) => cb());
}

/**
 * Borra la franja guardada de una landing y avisa a quien la esté mostrando.
 *
 * Se usa cuando en el mismo equipo se abre el link de OTRA promotora: la franja
 * resuelta es de la anterior y, si el link nuevo no logra resolver la suya, la
 * vieja seguiría acompañando todo el recorrido con el nombre equivocado.
 */
export function borrarFranja(landingSlug: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(clave(landingSlug));
  } catch {
    // Sin storage no había nada guardado.
  }
  suscriptores.forEach((cb) => cb());
}
