/**
 * Zona táctil de 44×44 sin cambiar cómo se ve el botón (QA en celular,
 * BAL-4969, bug 8 del reporte).
 *
 * Un pseudo-elemento `::before` transparente, centrado sobre el botón, de al
 * menos 44×44 (o del tamaño del botón si ya es más grande en un eje). El
 * toque que cae en ese borde invisible es del botón. El botón queda
 * `relative` para que el pseudo-elemento se ubique sobre él: no usarlo en un
 * botón `absolute`/`fixed` (ahí hay que envolverlo) ni con `overflow-hidden`
 * (lo recortaría). Tampoco sirve en botones de NextUI/react-aria (`usePress`
 * descarta el toque que cae fuera de la caja del botón): ahí, padding.
 */
export const ZONA_TACTIL_44 =
  "relative before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:min-h-full before:min-w-full before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']";

