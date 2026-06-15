/**
 * Tema oscuro por landing (slug-based).
 *
 * Las páginas de flujo (catálogo, detalle, solicitar, complementos, confirmación)
 * adoptan el tema oscuro + botones verdes de la landing NVIDIA cuando su slug está
 * en DARK_LANDINGS. Es opt-in: cualquier otro slug se renderiza claro como hoy.
 *
 * Ver THEME_DARK.md (raíz del proyecto) para la guía completa.
 */

/** Landings que se renderizan con tema oscuro en sus páginas de flujo. */
export const DARK_LANDINGS = ['nvidia'];

export function isDarkLanding(slug: string): boolean {
  return DARK_LANDINGS.includes(slug);
}

/** Colores de marca para landings oscuras (paleta oficial NVIDIA). */
export const NVIDIA_GREEN = '#76B900';
export const NVIDIA_TURQUOISE = '#00D9CB';
