/**
 * El traspaso de la constancia entre el cierre del KYC y la confirmación.
 *
 * El §4 paso 12 pide poner la copia a disposición de la persona *en el acto*.
 * El link lo devuelve `/completar`, pero ahí mismo el flujo navega a otra ruta,
 * así que hay que llevarlo de una pantalla a la otra.
 *
 * Va en `localStorage` y no en la URL a propósito: la URL de una constancia
 * queda en el historial del navegador, en el Referer y en cualquier log
 * intermedio, y es un documento con el nombre y el DNI de alguien adentro.
 *
 * Es una comodidad, no el canal: si no está —otro dispositivo, modo privado—
 * no se rompe nada. La copia sigue archivada del lado de Balde K y la
 * constancia de que se puso a disposición ya quedó registrada en la solicitud.
 */
const PREFIJO = 'bc_kyc_constancia';

function clave(landing: string, code: string): string {
  return `${PREFIJO}:${landing}:${code}`;
}

export function guardarConstancia(landing: string, code: string, url: string): void {
  if (!landing || !code || !url) return;
  try {
    window.localStorage.setItem(clave(landing, code), url);
  } catch {
    // Modo privado, cuota llena, cookies bloqueadas. Se pierde la comodidad,
    // no el documento.
  }
}

export function leerConstancia(landing: string, code: string): string | null {
  if (!landing || !code) return null;
  try {
    return window.localStorage.getItem(clave(landing, code));
  } catch {
    return null;
  }
}

export function olvidarConstancia(landing: string, code: string): void {
  if (!landing || !code) return;
  try {
    window.localStorage.removeItem(clave(landing, code));
  } catch {
    // Idem.
  }
}
