/**
 * Link especial (BAL-5191): Haru manda al estudiante el detalle de un equipo
 * que no se ve en el catálogo, con `?acceso=TOKEN`. El token se guarda por
 * landing en sessionStorage porque la ficha reescribe la URL
 * (term/initial/frecuency) y el paso a /solicitar descarta el querystring.
 * El backend decide si sirve: acá solo se guarda y se reenvía.
 */
const key = (landing: string) => `baldecash-${landing}-special-link`;

export const MENSAJE_LINK_ESPECIAL_VENCIDO =
  'Tu link especial venció o ya se usó. Pídele uno nuevo a tu asesora.';

export function captureSpecialLink(landing: string, search: URLSearchParams): void {
  const token = search.get('acceso');
  if (!token) return;
  try {
    sessionStorage.setItem(key(landing), token);
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
