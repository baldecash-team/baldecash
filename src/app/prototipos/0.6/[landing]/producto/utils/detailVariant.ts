import { isCopiaHomeStyleLanding } from '@/app/prototipos/0.6/utils/theme';

/** Variante de ficha de producto a dibujar. */
export type DetailVariant =
  /** Ficha estándar (con el banner "Producto semi nuevo" en reacondicionados). */
  | 'standard'
  /** Variante con selector de grados A/B/C, layout de dos columnas. */
  | 'grades-desktop'
  /** Variante con selector de grados, secciones plegables. */
  | 'grades-mobile'
  /** Todavía no se puede decidir: falta que resuelva la configuración de la landing. */
  | 'pending';

interface DetailVariantInput {
  landing: string;
  /**
   * `features.overlay_variant` de la landing. `null` = todavía no resolvió:
   * llega en su propio pedido, aparte del layout (ver LayoutContext).
   */
  overlayVariant: string | null;
  isMobile: boolean;
  isRefurbished: boolean;
}

const FAMILY_FARM_VARIANT = 'familyfarm';

/**
 * Decide qué ficha de producto corresponde.
 *
 * Hay dos caminos hacia el selector de grados, y no son intercambiables:
 *
 * - `copia-home` y las landings `renueva-*` entran **por slug**, que se conoce
 *   sin pedir nada. En mobile usan la variante para todos los equipos.
 * - Family Farms entra **por variante de overlay**, que llega por API. Solo para
 *   reacondicionados: el pedido es mostrar grados, y un equipo nuevo no tiene.
 *
 * Por eso existe `pending`. Decidir con `overlayVariant` en null dibujaría la
 * ficha estándar y saltaría al selector medio segundo después, con media columna
 * cambiando entera. Es el mismo criterio con el que LayoutContext prefiere no
 * mostrar logo antes que mostrar el equivocado.
 */
export function resolveDetailVariant({
  landing,
  overlayVariant,
  isMobile,
  isRefurbished,
}: DetailVariantInput): DetailVariant {
  if (isCopiaHomeStyleLanding(landing)) {
    if (isMobile) return 'grades-mobile';
    return isRefurbished ? 'grades-desktop' : 'standard';
  }

  // Ninguna variante cambia la ficha de un equipo nuevo, así que no hay nada que
  // esperar: se resuelve sin importar la configuración.
  if (!isRefurbished) return 'standard';

  if (overlayVariant === null) return 'pending';

  if (overlayVariant === FAMILY_FARM_VARIANT) {
    return isMobile ? 'grades-mobile' : 'grades-desktop';
  }

  return 'standard';
}
