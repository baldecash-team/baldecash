/**
 * Persistencia local de la elección de la oferta (BAL-2064).
 *
 * Guarda, POR TOKEN (una sola selección activa), el equipo elegido con su
 * variant/combo/slug y sus datos de display (nombre/marca/imagen/cuota). Se
 * escribe al hacer clic en "Elegir"/"Aceptar" desde catálogo/detalle/portada; la
 * página de accesorios (mini-checkout) la lee para saber qué equipo cargar SIN
 * query params en la URL (`/oferta/{token}/complementos` limpia) y para mostrar el
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
  /** Plazo (meses) elegido en el detalle — el mini-checkout lo usa para calcular
   *  las cuotas de accesorios/seguros al mismo plazo (BAL-2096). */
  term?: number;
  /** Inicial (%) elegido en el detalle — mismo uso que `term` (BAL-2097). */
  initial?: number;
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

/** Prefijo de las keys de add-ons por equipo (`oferta:addons:{token}:{variantId}`),
 *  que persiste el mini-checkout de complementos. */
function addonsKeyPrefix(token: string): string {
  return `oferta:addons:${token}:`;
}

/** Borra los add-ons guardados de TODOS los equipos de este token. Se usa al
 *  cambiar de equipo (dentro de saveOfferSelection) y al ENTRAR a complementos
 *  desde el index (BAL-2255): en ambos casos es una "entrada nueva" que debe
 *  resetear a lo que realmente tiene el pedido, no rehidratar una selección
 *  previa. El refresh DENTRO de complementos no llama esta función, así que su
 *  selección se conserva (persistencia útil intacta). */
export function clearAllAddons(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    const prefix = addonsKeyPrefix(token);
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(prefix)) toRemove.push(k);
    }
    toRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignorar */
  }
}

export function saveOfferSelection(token: string, selection: OfferSelection): void {
  if (typeof window === 'undefined') return;
  try {
    // Si cambia el equipo (variantId distinto al guardado), limpiar los add-ons
    // de cualquier equipo previo → el nuevo equipo empieza sin accesorios/seguros.
    const previa = readOfferSelection(token);
    if (previa && previa.variantId !== selection.variantId) {
      clearAllAddons(token);
    }
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
      term: typeof p.term === 'number' ? p.term : undefined,
      initial: typeof p.initial === 'number' ? p.initial : undefined,
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
