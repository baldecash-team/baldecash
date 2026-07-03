/**
 * Persistencia local de la elección de la oferta (BAL-2064).
 *
 * Guarda, por token + variante, el equipo elegido (nombre/imagen/cuota) al hacer
 * clic en "Elegir"/"Aceptar" desde catálogo/detalle/portada. La página de
 * accesorios (mini-checkout) lo lee para mostrar el equipo correcto en el modal
 * de confirmación sin depender de getOffer (que solo conoce el recomendado / la
 * oferta exclusiva, no cualquier equipo del catálogo) ni ensuciar la URL con
 * nombre e imagen.
 *
 * Se ata a la variante para no arrastrar el equipo/add-ons de otra elección. Se
 * limpia al confirmar (ya queda en BD).
 */

export interface StoredEquipo {
  name: string;
  brand?: string;
  imageUrl?: string;
  monthly?: number;
}

function equipoKey(token: string, variantId: number): string {
  return `oferta:equipo:${token}:${variantId}`;
}

export function saveStoredEquipo(token: string, variantId: number, equipo: StoredEquipo): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(equipoKey(token, variantId), JSON.stringify(equipo));
  } catch {
    /* cuota llena / modo privado: ignorar, no rompe el flujo */
  }
}

export function readStoredEquipo(token: string, variantId: number): StoredEquipo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(equipoKey(token, variantId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.name !== 'string') return null;
    return {
      name: parsed.name,
      brand: typeof parsed.brand === 'string' ? parsed.brand : undefined,
      imageUrl: typeof parsed.imageUrl === 'string' ? parsed.imageUrl : undefined,
      monthly: typeof parsed.monthly === 'number' ? parsed.monthly : undefined,
    };
  } catch {
    return null;
  }
}

export function clearStoredEquipo(token: string, variantId: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(equipoKey(token, variantId));
  } catch {
    /* ignorar */
  }
}
