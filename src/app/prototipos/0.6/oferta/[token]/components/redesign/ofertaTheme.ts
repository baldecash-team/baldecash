/**
 * Tokens de color del rediseño visual del flujo de oferta (BAL-2183/2184).
 *
 * Fuente única de verdad para los hex del mock de Claude Design
 * (docs/superpowers/design-refs/mock-index.html). Los componentes de
 * `components/redesign/` deben importar estas constantes en vez de
 * hardcodear hex sueltos, para que un cambio de paleta se propague desde
 * un solo lugar.
 *
 * La lógica de negocio del flujo de oferta NO cambia con este rediseño:
 * este archivo solo centraliza estilos visuales.
 */

export const OFERTA_COLORS = {
  /** Azul BaldeCash — CTAs primarios, monto héroe, acentos.
   *
   *  Era '#4F46E5' (índigo del mock). Se alinea al azul de marca real, que es
   *  el que usa el resto del producto. Como este archivo es la fuente única de
   *  los hex, el cambio se propaga a TODOS los componentes de `redesign/` —
   *  incluido el flujo upsell, que es justamente lo que se quiere: una sola
   *  marca en las dos pantallas. */
  primary: '#4654CD',
  primaryHover: '#3A46AE',

  /** Verde — estados de éxito, Caso 4 (downgrade aprobado) y la decisión de
   *  aceptar (WEB-02). El botón usa `greenDark`: sobre `green` el texto blanco
   *  no llega al contraste mínimo. */
  green: '#22C55E',
  greenDark: '#16A34A',
  greenSoft: '#E8F8EF',
  greenBadgeBg: '#DCFCE7',

  /** Rojo — la decisión de rechazar (WEB-02). Aceptar y rechazar dejaron de ser
   *  dos botones neutros: el color dice qué hace cada uno antes de leerlo. */
  red: '#DC2626',
  redDark: '#B91C1C',
  redSoft: '#FEE2E2',

  /** Teal y índigo del logo bicolor BaldeCash. */
  tealBrand: '#12B3A6',
  indigoBrand: '#312E81',

  /** Fondos. */
  lilac: '#EEF1FF',
  grayBg: '#F7F8FB',

  /** Ámbar — avisos empáticos (Caso 4: equipo pedido no disponible). */
  amberBg: '#FEF3E2',
  amberBorder: '#FADFB5',

  /** Bordes y texto. */
  border: '#E7E9F0',
  textStrong: '#1F2333',
  textMid: '#6B7280',
  textSoft: '#9CA3AF',
} as const;

export type OfertaColorToken = keyof typeof OFERTA_COLORS;
