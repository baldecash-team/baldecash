/**
 * Gate G2 (envío anticipado): con el contrato firmado no se puede volver a un
 * paso anterior del wizard —ni por el indicador de pasos, ni por "Atrás"—;
 * ese documento ya quedó sellado con esos datos, y volver a esos pasos
 * dejaría creer que todavía se pueden editar.
 *
 * Extraído en su propio módulo, aparte de `StepClient`, para poder probar la
 * regla sin levantar ese componente entero: depende de ~10 contexts/hooks
 * (wizard, producto, sesión, layout, flujo de solicitud, envío…) que no
 * tienen nada que ver con esta decisión. `handleStepClickContrato` y
 * `handleSummaryBack` (acotado al branch del contrato) llaman a la MISMA
 * función en vez de repetir el `if` cada uno.
 */
export function irAPasoSiNoFirmado(contratoFirmado: boolean, navegar: () => void): void {
  if (contratoFirmado) return;
  navegar();
}
