// Diseño 2 de la solicitud (rediseño de Brenda). F1 · marco (BAL-4959).
//
// Solo la superficie que usa la app desde fuera del kit. Los ayudantes
// internos (`pasoEsClicable`, `siguientePendiente`, `compensarAncla`,
// `DURACION_*`…) se importan de su archivo, también desde sus tests
// (menor 8 de la revisión final, BAL-4969).
export { ShellV2 } from './ShellV2';
export type { ShellV2Props } from './ShellV2';
export { BarraInferiorV2, BarraInferiorV2Spacer } from './BarraInferiorV2';
export { TransicionDelWizard } from './TransicionPaso';
