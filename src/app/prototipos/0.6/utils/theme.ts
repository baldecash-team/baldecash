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

/** La landing nvidia usa su propio header (NvidiaNavbar) en todas sus rutas de flujo. */
export function isNvidiaLanding(slug: string): boolean {
  return slug === 'nvidia';
}

/** La landing zona-gamer usa su propio header/footer y tema gaming en todas sus rutas de flujo. */
export function isGamerLanding(slug: string): boolean {
  return slug === 'zona-gamer';
}

/**
 * La landing copia-home usa variantes dedicadas del catálogo y del detalle
 * (mockup seminuevos):
 *  - Mobile: catálogo (finder compacto, cards con imagen a la izquierda, FAB de
 *    filtros) y detalle (grados + recojo en oficina) para todos los equipos.
 *  - Desktop: SOLO el detalle de equipos reacondicionados usa la variante
 *    (layout de dos columnas + grados + banner de agendamiento). El catálogo y
 *    los equipos nuevos en desktop siguen con el detalle/catálogo estándar.
 * El dispatch de detalle vive en ProductDetailClient; el de catálogo en
 * CatalogoClient.
 */
export function isCopiaHomeLanding(slug: string): boolean {
  return slug === 'copia-home';
}

/**
 * Landings de segundo financiamiento: su slug contiene "renueva-".
 * Reciben la experiencia mobile seminuevos (item 12), con envío diferido para
 * iPads, pero SIN el CTA "volver al Grado A" (item 6 excluido).
 */
export function isSecondFinancingLanding(slug: string): boolean {
  return /renueva-/i.test(slug);
}

/**
 * Landings que usan la variante mobile "copia-home" (seminuevos): la propia
 * `copia-home` y las de segundo financiamiento (`renueva-*`).
 */
export function isCopiaHomeStyleLanding(slug: string): boolean {
  return isCopiaHomeLanding(slug) || isSecondFinancingLanding(slug);
}

/**
 * Landing de equipos reacondicionados (id 241, slug `reacondicionados`).
 *
 * Usa un catálogo propio: grilla de 2 columnas en móvil y card reducida, con
 * una zona bajo el nombre que muestra grados o colores. Aplica a TODOS los
 * productos de la landing, sean reacondicionados o nuevos: lo que cambia entre
 * unos y otros es el contenido de esa zona, no el diseño de la card.
 *
 * Es EXCLUSIVO de esta landing: se detecta por slug exacto, no por prefijo,
 * para que ninguna landing nueva lo herede por accidente (BAL-3288).
 *
 * Ojo: NO se apoya en `isCopiaHomeStyleLanding`. Aunque las dos son de
 * seminuevos, son diseños distintos y no comparten componentes.
 */
export function isReacondicionadosLanding(slug: string): boolean {
  return slug === 'reacondicionados';
}

/** Colores de marca para landings oscuras (paleta oficial NVIDIA). */
export const NVIDIA_GREEN = '#76B900';
export const NVIDIA_TURQUOISE = '#00D9CB';
