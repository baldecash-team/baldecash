/**
 * Diseño de la solicitud de ESTA sesión (BAL-5296).
 *
 * Con «diseño por formulario» el diseño lo decide el formulario que le tocó a
 * la visita, no la landing. Una vez que ws2 lo dice (al apretar «Lo quiero» o
 * en el wizard) se guarda aquí, por landing, para que catálogo, ficha, pasos y
 * confirmación pinten lo mismo durante toda la sesión.
 *
 * sessionStorage puede estar bloqueado (modo privado, iframes): ante cualquier
 * falla se lee `null` y la web usa el diseño de la landing, como hoy.
 */

export type DisenoSolicitud = 1 | 2;

function clave(landing: string): string {
  return `baldecash-${landing}-diseno-sesion`;
}

export function leerDisenoDeLaSesion(landing: string): DisenoSolicitud | null {
  try {
    const crudo = sessionStorage.getItem(clave(landing));
    if (crudo === '1') return 1;
    if (crudo === '2') return 2;
    return null;
  } catch {
    return null;
  }
}

export function guardarDisenoDeLaSesion(landing: string, d: DisenoSolicitud): void {
  try {
    sessionStorage.setItem(clave(landing), String(d));
  } catch {
    // Sin sessionStorage el diseño vive solo en memoria (estado del contexto).
  }
}
