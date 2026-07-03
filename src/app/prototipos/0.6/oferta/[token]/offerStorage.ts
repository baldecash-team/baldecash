/**
 * Persistencia local de la elección de la oferta (BAL-2064).
 *
 * Guarda, POR TOKEN (una sola selección activa), el equipo elegido con su
 * variant/combo/slug y sus datos de display (nombre/marca/imagen/cuota). Se
 * escribe al hacer clic en "Elegir"/"Aceptar" desde catálogo/detalle/portada; la
 * página de accesorios (mini-checkout) la lee para saber qué equipo cargar SIN
 * query params en la URL (`/oferta/{token}/accesorios` limpia) y para mostrar el
 * equipo correcto en el modal de confirmación.
 *
 * Es una entrada única por token (no por variante): elegir otro equipo la
 * sobrescribe. Se limpia al confirmar (ya queda en BD). Si no existe al abrir
 * accesorios (link directo / storage limpio), la página redirige a la portada.
 */

export interface StoredEquipo {
  name: string;
  brand?: string;
  imageUrl?: string;
  monthly?: number;
}

export interface OfferSelection extends StoredEquipo {
  /** Variante elegida — clave del mini-checkout (add-ons, confirmación). */
  variantId: number;
  /** Combo del que nace la elección (para sincronizar el accesorio gratis a
   *  legacy). Null si el equipo no viene de un combo. */
  comboId: number | null;
  /** Slug del producto — destino del botón "Volver al equipo". */
  slug: string | null;
}

function selectionKey(token: string): string {
  return `oferta:seleccion:${token}`;
}

export function saveOfferSelection(token: string, selection: OfferSelection): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(selectionKey(token), JSON.stringify(selection));
  } catch {
    /* cuota llena / modo privado: ignorar, no rompe el flujo */
  }
}

export function readOfferSelection(token: string): OfferSelection | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(selectionKey(token));
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p || typeof p.name !== 'string' || typeof p.variantId !== 'number') return null;
    return {
      variantId: p.variantId,
      comboId: typeof p.comboId === 'number' ? p.comboId : null,
      slug: typeof p.slug === 'string' ? p.slug : null,
      name: p.name,
      brand: typeof p.brand === 'string' ? p.brand : undefined,
      imageUrl: typeof p.imageUrl === 'string' ? p.imageUrl : undefined,
      monthly: typeof p.monthly === 'number' ? p.monthly : undefined,
    };
  } catch {
    return null;
  }
}

export function clearOfferSelection(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(selectionKey(token));
  } catch {
    /* ignorar */
  }
}
