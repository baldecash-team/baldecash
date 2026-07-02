/**
 * otpHandoff — traspaso de datos del OTP inline entre rutas del flujo solicitar.
 *
 * Tras el submit, cuando la landing tiene `otp_verification` habilitado, el flujo
 * navega a `/{landing}/solicitar/verificacion`. El `application_id` y el `code`
 * viajan por la URL, pero el DNI es PII y NO debe ir en la URL: se guarda aquí en
 * `sessionStorage` (sobrevive un refresh en la misma pestaña).
 *
 * También sirve de fuente de verdad ligera para el guard de `/confirmacion`:
 * si existe un handoff sin verificar para esa solicitud, el resumen redirige a
 * `/verificacion` para forzar el OTP antes de mostrar el estado.
 *
 * El estado autoritativo de verificación vive en el backend (email_verification
 * por `application_id`); este handoff es solo un puntero local del funnel.
 */

export interface OtpHandoff {
  applicationId: number;
  /** Código público de la solicitud (para navegar a /confirmacion). */
  code?: string;
  /** DNI capturado del formulario, usado para enviar/verificar (ownership). */
  dni?: string;
  /** true una vez que el correo quedó verificado (o ya lo estaba). */
  verified: boolean;
}

function key(landing: string): string {
  return `baldecash-${landing}-otp-handoff`;
}

export function saveOtpHandoff(landing: string, data: OtpHandoff): void {
  try {
    sessionStorage.setItem(key(landing), JSON.stringify(data));
  } catch {
    // sessionStorage no disponible (SSR/privado) — el flujo degrada a modo DNI.
  }
}

export function readOtpHandoff(landing: string): OtpHandoff | null {
  try {
    const raw = sessionStorage.getItem(key(landing));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OtpHandoff;
    if (typeof parsed?.applicationId !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Marca el handoff como verificado (idempotente). No falla si no existe. */
export function markOtpVerified(landing: string, applicationId: number): void {
  const current = readOtpHandoff(landing);
  if (current && current.applicationId === applicationId) {
    saveOtpHandoff(landing, { ...current, verified: true });
    return;
  }
  saveOtpHandoff(landing, { applicationId, verified: true });
}

export function clearOtpHandoff(landing: string): void {
  try {
    sessionStorage.removeItem(key(landing));
  } catch {
    // no-op
  }
}
