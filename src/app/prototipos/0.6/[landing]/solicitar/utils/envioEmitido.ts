/**
 * `application_submitted` se emite UNA vez por solicitud.
 *
 * La confirmación lo emite al montarse, y se monta más de una vez: recarga, la
 * pestaña restaurada, "atrás" desde el catálogo. Cada montaje repetía el evento
 * y, si para entonces la sesión de tracking ya era otra —la del siguiente
 * alumno del stand—, ws2 (`_vincular_solicitud`) ataba esa sesión a la
 * solicitud vieja por el `application_code` del evento.
 *
 * Se recuerda el ÚLTIMO código emitido por landing, no una lista: alcanza para
 * cortar la repetición y no crece con el uso del equipo.
 */
const envioEmitidoKey = (landing: string) => `baldecash-${landing}-envio-emitido`;

/**
 * Reclama la emisión del evento para `code`. Devuelve true la primera vez y
 * false en las siguientes. Sin storage devuelve true: se emite como siempre.
 */
export function reclamarEmisionDelEnvio(landing: string, code: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (localStorage.getItem(envioEmitidoKey(landing)) === code) return false;
    localStorage.setItem(envioEmitidoKey(landing), code);
    return true;
  } catch {
    return true;
  }
}
