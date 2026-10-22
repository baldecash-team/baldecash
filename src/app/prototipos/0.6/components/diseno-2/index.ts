// Diseño 2 de la solicitud (rediseño de Brenda). F1 · marco (BAL-4959).
export { ShellV2, pasosDelProgreso } from './ShellV2';
export type { ShellV2Props } from './ShellV2';
export { ProgresoV2, ProgresoMovilV2, pasoEsClicable } from './ProgresoV2';
export type { PasoDelProgreso, ProgresoV2Props } from './ProgresoV2';
export { PanelSolicitudV2, CabeceraSolicitudV2, cuotaDelPlazo, useDatosDelPanel } from './PanelSolicitudV2';
export { BarraInferiorV2, BarraInferiorV2Spacer } from './BarraInferiorV2';
export { TransicionPaso, TransicionDelWizard, DURACION_TRANSICION_MS } from './TransicionPaso';
export {
  useGuiaDeCampos,
  siguientePendiente,
  campoPendiente,
  valorVacio,
  esDeLargoFijo,
  elegirDestinoContinuar,
} from './useGuiaDeCampos';
export type { CampoDeLaGuia, DestinoDeLaGuia } from './useGuiaDeCampos';
export { useErroresAlSalir } from './useErroresAlSalir';
export { SeccionPlegable, abrirSeccionDe, compensarAncla, EVENTO_ABRIR_SECCION, SELECTOR_SECCION_CERRADA, DURACION_CIERRE_MS } from './SeccionPlegable';
export type { SeccionPlegableProps } from './SeccionPlegable';
export { armarBloques, camposPegados, ordenConPegados, seccionCompleta, resumenDeSeccion, textoDelCampo, parteDelResumen, etiquetaCorta } from './secciones';
export type { BloqueDelPaso } from './secciones';
