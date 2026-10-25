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

/**
 * Si la landing puede usar Diseño 2 de la solicitud (BAL-4969, I-2).
 *
 * Zona gamer se queda en Diseño 1 aunque tenga `solicitud_design = 2`: no es
 * solo un tema oscuro, tiene su propio catálogo (`GamerCatalogoContent`), su
 * propia entrada a la solicitud (`GamerSolicitarContent`), su header/footer y
 * un tema claro/oscuro propio (`data-bc-theme`); el kit de Diseño 2 no pasa por
 * ninguno de esos caminos.
 *
 * Las landings de tema oscuro (`isDarkLanding`, p. ej. nvidia) SÍ admiten
 * Diseño 2 desde BAL-5076: el kit tiene su versión oscura con los tokens
 * `--d2-*` de `src/app/d2-tokens.css`, que se activan con el mismo
 * `data-theme="nvidia"` que pone `LayoutContext`.
 *
 * `renueva-*` no se decide aquí: su motivo es otro (segundo financiamiento) y
 * lo bloquean admin2 y ws2; en la web `/solicitar` deja su intro propia
 * (`isSecondFinancingLanding`).
 */
export function admiteDiseno2(slug: string): boolean {
  return !isGamerLanding(slug);
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
 * Hoy solo cambian el formulario de solicitud (contador del wizard). La ficha
 * de producto es la estándar, la misma de `home`: hasta el 29-sep-2026 usaban
 * la variante de grados de `copia-home`.
 */
export function isSecondFinancingLanding(slug: string): boolean {
  return /renueva-/i.test(slug);
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
 * Ojo: NO se apoya en `isCopiaHomeLanding`. Aunque las dos son de
 * seminuevos, son diseños distintos y no comparten componentes.
 */
export function isReacondicionadosLanding(slug: string): boolean {
  return slug === 'reacondicionados';
}

/** Colores de marca para landings oscuras (paleta oficial NVIDIA). */
export const NVIDIA_GREEN = '#76B900';
export const NVIDIA_TURQUOISE = '#00D9CB';
