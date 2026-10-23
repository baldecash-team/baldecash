import type { WizardStep } from '../../../services/wizardApi';

/**
 * El primer paso del formulario al que entra la persona: el primero que no es
 * el resumen. `steps` ya viene ordenado desde `WizardConfigContext`.
 *
 * Lo comparten la intro de /solicitar y el modal de "Lo quiero" (BAL-4852),
 * que salta la intro y tiene que llegar exactamente al mismo paso.
 */
export function primerPasoRegular(steps: WizardStep[]): WizardStep | null {
  return steps.find((s) => !s.is_summary_step) ?? null;
}

/** El segmento de URL del paso: `url_slug` y, si falta, `code`. */
export function slugDelPaso(step: WizardStep | null): string | null {
  if (!step) return null;
  return step.url_slug || step.code || null;
}
