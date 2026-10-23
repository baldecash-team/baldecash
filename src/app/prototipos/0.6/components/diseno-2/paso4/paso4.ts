/**
 * Paso 4 · Resumen de Diseño 2 (BAL-4966): las reglas puras.
 *
 * En Diseño 2 los seguros dejan `/solicitar/complementos` y entran al paso
 * resumen. Acá vive el "cuándo": si la sección va en el Paso 4, si todavía hay
 * que pasar por complementos y qué dice el botón de envío. Diseño 1 no usa
 * nada de esto.
 */

import type { SolicitarSection } from '@/app/prototipos/0.6/services/landingApi';
import type { WizardStep } from '@/app/prototipos/0.6/services/wizardApi';
import { nombreDelSaludoDelPaso } from '../paso1/datosPersonalesV2';

type Valores = Record<string, string | string[]>;

/** La landing tiene la sección `insurance` activa DESPUÉS del wizard. */
export function tieneSeccionDeSeguros(sectionsAfterWizard: readonly SolicitarSection[] | undefined): boolean {
  return (sectionsAfterWizard ?? []).some((s) => s.type === 'insurance');
}

/**
 * La solicitud ya existe antes de este paso (envío anticipado, decisión D5).
 *
 * - `yaEnviada`: hay handoff de esta sesión, o sea ya se creó.
 * - O la landing la crea en una pantalla ANTERIOR a esta (`envioAnticipadoStep`
 *   es 1-indexado; `indicePaso` es 0-indexado).
 *
 * Si la crea ESTA misma pantalla, no cuenta: el submit de acá todavía puede
 * llevar los seguros.
 */
export function solicitudCreadaAntesDelPaso(
  envioAnticipadoStep: number | null | undefined,
  indicePaso: number,
  yaEnviada: boolean,
): boolean {
  if (yaEnviada) return true;
  if (envioAnticipadoStep == null || indicePaso < 0) return false;
  return envioAnticipadoStep < indicePaso + 1;
}

export interface SegurosEnElPaso4 {
  diseno2: boolean;
  esResumen: boolean;
  /** Este paso es el que envía (el último, o el del envío anticipado). */
  esElQueEnvia: boolean;
  sectionsAfterWizard: readonly SolicitarSection[] | undefined;
  envioAnticipadoStep: number | null | undefined;
  indicePaso: number;
  yaEnviada: boolean;
}

/**
 * Los seguros se pintan (y viajan) en el Paso 4 cuando:
 * - la landing está en Diseño 2 y este es el resumen que envía;
 * - la landing tiene la sección `insurance` activa;
 * - la solicitud NO se creó antes (D5): hoy no hay forma de agregar seguros a
 *   una solicitud que ya existe —el submit de ws2 es idempotente por sesión y
 *   devuelve la previa sin tocarla—, así que ofrecerlos ahí sería cobrar en
 *   pantalla algo que nunca llega al backend.
 */
export function segurosVanEnElPaso4(o: SegurosEnElPaso4): boolean {
  if (!o.diseno2 || !o.esResumen || !o.esElQueEnvia) return false;
  if (!tieneSeccionDeSeguros(o.sectionsAfterWizard)) return false;
  return !solicitudCreadaAntesDelPaso(o.envioAnticipadoStep, o.indicePaso, o.yaEnviada);
}

/**
 * ¿Queda algo que mostrar en `/complementos`? En Diseño 2 los seguros no
 * cuentan (van en el Paso 4); OTP y KYC ya vienen fuera de
 * `sectionsAfterWizard` porque van después del envío. Diseño 1: lo de siempre.
 */
export function hayComplementosDespues(
  sectionsAfterWizard: readonly SolicitarSection[] | undefined,
  diseno2: boolean,
  shouldShowComplementos: boolean,
): boolean {
  if (!diseno2) return shouldShowComplementos;
  return (sectionsAfterWizard ?? []).some((s) => s.type !== 'insurance');
}

/**
 * Las secciones que pinta `/complementos`. En Diseño 2, si el formulario tiene
 * paso resumen, los seguros ya se ofrecieron ahí y no se repiten. Sin resumen
 * (no hay Paso 4) o en Diseño 1, todas, como siempre.
 */
export function seccionesDeComplementos<T extends { type: string }>(
  sections: readonly T[],
  diseno2: boolean,
  hayPasoResumen: boolean,
): T[] {
  if (!diseno2 || !hayPasoResumen) return [...sections];
  return sections.filter((s) => s.type !== 'insurance');
}

/** "Enviar solicitud" / "Enviar con 1 protección" / "Enviar con 2 protecciones". */
export function textoDelEnvio(protecciones: number): string {
  if (protecciones <= 0) return 'Enviar solicitud';
  return `Enviar con ${protecciones} ${protecciones === 1 ? 'protección' : 'protecciones'}`;
}

/**
 * El nombre para "¡Último paso, {Nombre}!": el mismo origen que el saludo del
 * Paso 1 (F4), buscado en los pasos regulares. `null` si no hay.
 */
export function nombreDelUltimoPaso(pasos: readonly WizardStep[], valores: Valores): string | null {
  for (const paso of pasos) {
    if (paso.is_summary_step) continue;
    const nombre = nombreDelSaludoDelPaso(paso, valores);
    if (nombre) return nombre;
  }
  return null;
}

/** El encabezado del Paso 4. El subtítulo de la BD manda; sin él, el de Brenda. */
export const SUBTITULO_PASO4 = 'Elige tu día de pago, confirma tu dirección y envía tu solicitud.';

export function encabezadoDelPaso4(
  step: Pick<WizardStep, 'title' | 'description'>,
  nombre: string | null,
): { antetitulo: string | null; titulo: string; subtitulo: string } {
  return {
    antetitulo: nombre ? `¡Último paso, ${nombre}!` : null,
    titulo: step.title,
    subtitulo: step.description?.trim() || SUBTITULO_PASO4,
  };
}
