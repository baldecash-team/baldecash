/**
 * Link especial (BAL-5191): Haru manda al estudiante el detalle de un equipo
 * que no se ve en el catálogo, con `?acceso=TOKEN`. El token se guarda por
 * landing en sessionStorage porque la ficha reescribe la URL
 * (term/initial/frecuency) y el paso a /solicitar descarta el querystring.
 * El backend decide si sirve: acá solo se guarda y se reenvía.
 *
 * El token es la llave personal del estudiante: NO puede quedar en la barra
 * de direcciones, porque GA4/GTM mandan la URL completa (`dl`/page_location)
 * en cada hit. Por eso se saca de la URL apenas se lee (ver
 * `ACCESO_EARLY_SCRIPT`, que corre antes que gtag y que React).
 */
const key = (landing: string) => `baldecash-${landing}-special-link`;

/**
 * Token que el script temprano del layout sacó de la URL antes de saber la
 * landing. La ficha lo pasa a la llave de su landing en `captureSpecialLink`.
 */
export const PENDING_SPECIAL_LINK_KEY = 'baldecash-special-link-pending';

export const MENSAJE_LINK_ESPECIAL_VENCIDO =
  'Tu link especial venció o ya se usó. Pídele uno nuevo a tu asesora.';

/**
 * La misma URL sin `acceso` (path + query + hash, relativa al origen), o null
 * si no lo trae. Los demás params quedan como estaban.
 */
export function urlSinAcceso(href: string): string | null {
  let url: URL;
  try {
    url = new URL(href, 'http://x');
  } catch {
    return null;
  }
  if (!url.searchParams.has('acceso')) return null;
  url.searchParams.delete('acceso');
  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Script inline del <head> (layout raíz). Corre al parsear el HTML, antes de
 * que carguen gtag/GTM (lazyOnload) y antes de que hidrate React: guarda el
 * token en sessionStorage y lo saca de la barra. Así ni el primer page_view
 * lleva `acceso`. Solo actúa en fichas (`/producto/`). Debe ser ES5 suelto.
 */
export const ACCESO_EARLY_SCRIPT =
  "(function(){try{var l=window.location;if(l.pathname.indexOf('/producto/')<0)return;" +
  "var u=new URL(l.href);var t=u.searchParams.get('acceso');if(!t)return;" +
  `try{sessionStorage.setItem('${PENDING_SPECIAL_LINK_KEY}',t);}catch(e){}` +
  "u.searchParams.delete('acceso');" +
  "window.history.replaceState(window.history.state,'',u.pathname+u.search+u.hash);" +
  "}catch(e){}})();";

/**
 * Saca `acceso` de la barra sin recargar ni tocar los demás params. Con
 * `state` null el router de Next se entera del cambio (useSearchParams).
 * Se difiere un tick porque se llama desde el render de la ficha.
 */
function quitarAccesoDeLaBarra(): void {
  if (typeof window === 'undefined') return;
  setTimeout(() => {
    try {
      const limpia = urlSinAcceso(window.location.href);
      if (limpia) window.history.replaceState(null, '', limpia);
    } catch {
      /* sin history no hay nada que limpiar */
    }
  }, 0);
}

export function captureSpecialLink(landing: string, search: URLSearchParams): void {
  const enUrl = search.get('acceso');
  // Navegación dentro de la SPA con ?acceso=: el script temprano no corrió.
  if (enUrl) quitarAccesoDeLaBarra();
  try {
    const token = enUrl ?? sessionStorage.getItem(PENDING_SPECIAL_LINK_KEY);
    if (!token) return;
    sessionStorage.setItem(key(landing), token);
    sessionStorage.removeItem(PENDING_SPECIAL_LINK_KEY);
  } catch {
    // Sin storage (modo privado) no hay pase: la ficha se ve como siempre.
  }
}

export function getSpecialLinkToken(landing: string): string | null {
  try {
    return sessionStorage.getItem(key(landing));
  } catch {
    return null;
  }
}

export function clearSpecialLink(landing: string): void {
  try {
    sessionStorage.removeItem(key(landing));
  } catch {
    /* nada que limpiar */
  }
}

/**
 * Token a marcar en el `SelectedProduct`: solo si el detalle confirmó que el
 * pase abrió ESTE producto (`special_link_product_id`). Un token guardado de
 * otro equipo no se pega a este.
 */
export function specialLinkTokenFor(
  landing: string,
  specialLinkProductId: number | undefined,
  productId: string | number,
): string | undefined {
  if (specialLinkProductId == null) return undefined;
  if (String(specialLinkProductId) !== String(productId)) return undefined;
  return getSpecialLinkToken(landing) ?? undefined;
}

/**
 * Aviso sobre la ficha cuando el token vino y no sirvió. `mismatch` es un token
 * guardado de otro equipo (el estudiante navegó a otra ficha): no se avisa,
 * porque el pase sigue vivo para el suyo.
 */
export function avisoDelLinkEspecial(motivo: string | undefined | null): string | null {
  if (!motivo || motivo === 'mismatch') return null;
  return MENSAJE_LINK_ESPECIAL_VENCIDO;
}
