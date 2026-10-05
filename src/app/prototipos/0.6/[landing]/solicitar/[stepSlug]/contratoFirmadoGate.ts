/**
 * Gate G2 (envío anticipado): con el contrato firmado no se puede volver a un
 * paso anterior del wizard —ni por el indicador de pasos, ni por "Atrás", ni
 * por URL directa—; ese documento ya quedó sellado con esos datos, y volver a
 * esos pasos dejaría creer que todavía se pueden editar.
 *
 * Las TRES decisiones (bloquear el indicador de pasos, bloquear "Atrás", y a
 * qué paso redirigir si se abrió uno anterior por URL) salen de esta única
 * función pura, extraída en su propio módulo aparte de `StepClient` para
 * poder probarla sin levantar ese componente entero: depende de ~10
 * contexts/hooks (wizard, producto, sesión, layout, flujo de solicitud,
 * envío…) que no tienen nada que ver con esta decisión. `StepClient` SOLO
 * consume el resultado — si alguien olvida cablear `onStepClick` con
 * `bloquearNavegacion`, o borra la rama del redirect, esta prueba no lo va a
 * cazar (esa cobertura es responsabilidad de `StepClient` mismo), pero si la
 * REGLA en sí se rompe —qué bloquea y a dónde redirige— acá se ve.
 */
export interface WizardStepSlugLike {
  url_slug?: string | null;
  code: string;
}

export interface GatesDelContratoArgs {
  /** El contrato de ESTA solicitud ya se firmó (`handoff.contratoAceptado`). */
  contratoFirmado: boolean;
  /** La landing tiene firma por aceptación + sub-paso `contract` (envío anticipado). */
  condicionesFijas: boolean;
  /** El paso actual es el de resumen/contrato (`ContratoEnWizard` ya montado ahí). */
  isSummaryStep: boolean;
  /** Los pasos de resumen de la landing; el primero es el del contrato. */
  summarySteps: WizardStepSlugLike[];
}

export interface GatesDelContratoResultado {
  /** Bloquea "Atrás" y el indicador de pasos hacia atrás en la pantalla del contrato. */
  bloquearNavegacion: boolean;
  /**
   * Slug al que hay que redirigir si se abrió por URL un paso ANTERIOR al del
   * contrato estando firmado. `null` si no aplica (no firmado, no es envío
   * anticipado, ya se está en el paso del contrato, o no hay a dónde ir).
   */
  redirigirA: string | null;
}

export function gatesDelContrato({
  contratoFirmado, condicionesFijas, isSummaryStep, summarySteps,
}: GatesDelContratoArgs): GatesDelContratoResultado {
  // Fuera del envío anticipado (`condicionesFijas` apagado) o sin firmar: nada
  // que bloquear ni a dónde redirigir — el wizard se comporta como siempre.
  if (!condicionesFijas || !contratoFirmado) {
    return { bloquearNavegacion: false, redirigirA: null };
  }

  // Firmado y ya en el paso del contrato: se bloquea Atrás/indicador, pero no
  // hay redirect — ya está donde tiene que estar.
  if (isSummaryStep) {
    return { bloquearNavegacion: true, redirigirA: null };
  }

  // Firmado, en un paso ANTERIOR (llegó por URL directa): se bloquea Y se
  // redirige, pero solo si hay a dónde — sin `summarySteps[0]` no existe el
  // paso del contrato que ofrecer, así que no emite ningún destino.
  const pasoContrato = summarySteps[0];
  const redirigirA = pasoContrato ? (pasoContrato.url_slug || pasoContrato.code) : null;
  return { bloquearNavegacion: true, redirigirA };
}
