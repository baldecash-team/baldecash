/**
 * "Hoy, HH:MM" del hito 1 de `LineaDeTiempoV2` (F8, BAL-4967): la hora real
 * del envío si está disponible, o solo "Hoy" si no.
 *
 * Recibe el `Date` YA resuelto desde `submitted_at` (no el `ReceivedData.
 * submittedAt` compartido con Diseño 1, que cae a `new Date()` cuando no hay
 * respuesta del API — esa hora "ahora" no es la hora real del envío).
 */
export function horaDeEnvio(fecha: Date | null | undefined): string {
  if (!fecha || Number.isNaN(fecha.getTime())) return 'Hoy';
  try {
    const hora = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(fecha);
    return `Hoy, ${hora}`;
  } catch {
    return 'Hoy';
  }
}
