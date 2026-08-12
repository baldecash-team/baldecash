/**
 * Traducción de respuestas HTTP a mensajes que un operador pueda accionar.
 *
 * Antes, cada punto de fallo mostraba `http_${status}` — un código que no le
 * dice nada a quien está parado frente a la estación con un equipo en la mano.
 * Peor: el backend YA manda un `detail` explicativo en español en casi todos
 * sus errores (ver los `HTTPException` de `app/api/routers/inspection/`), y el
 * front lo estaba descartando.
 *
 * El orden de preferencia es siempre el mismo:
 *   1. El `detail` del backend — es el más específico y conoce el caso real.
 *   2. Un mensaje por status, escrito para esta app.
 *   3. El status crudo, solo si todo lo anterior falló.
 *
 * `leerDetalle` no lanza nunca: se la llama dentro de handlers de error, y una
 * excepción ahí taparía el error original con uno peor ("Unexpected token < in
 * JSON") — el modo de falla clásico cuando un proxy devuelve HTML.
 */

/** Mensajes por status, en el vocabulario de la estación. */
const POR_STATUS: Record<number, string> = {
  400: 'Los datos enviados no son válidos.',
  401: 'Este dispositivo perdió su vinculación. Volvé a vincularlo con un código nuevo.',
  403: 'Este dispositivo no tiene permiso para esta acción. Verificá que sea el escáner de la estación.',
  404: 'No se encontró lo que se buscaba. Puede que la inspección ya se haya cerrado.',
  409: 'La estación ya tiene una inspección en curso.',
  410: 'El código de vinculación venció. Los códigos duran 10 minutos — emití uno nuevo.',
  413: 'El archivo es demasiado grande.',
  422: 'El serial no tiene un formato válido. Revisá que no tenga espacios ni símbolos raros.',
  429: 'Demasiados intentos seguidos. Esperá unos segundos y volvé a intentar.',
  500: 'Hubo un error en el servidor. Si se repite, avisá al equipo técnico.',
  502: 'El servidor no está respondiendo. Reintentá en unos segundos.',
  503: 'El servicio de inspección está deshabilitado o en mantenimiento.',
  504: 'El servidor tardó demasiado en responder. Reintentá.',
};

/**
 * Extrae el mensaje de una respuesta fallida sin lanzar nunca.
 *
 * FastAPI devuelve `{"detail": "..."}` para los `HTTPException`, pero para los
 * errores de validación (422) `detail` es un ARRAY de objetos, no un string —
 * renderizarlo directo pinta "[object Object]" en pantalla. Por eso se
 * distingue el caso y se arma un mensaje legible con el campo que falló.
 */
export async function leerDetalle(res: Response): Promise<string | null> {
  try {
    const cuerpo = await res.clone().json();
    const detail = cuerpo?.detail;

    if (typeof detail === 'string' && detail.trim()) return detail.trim();

    // 422 de Pydantic: [{loc: ['body','serial'], msg: '...'}, ...]
    if (Array.isArray(detail) && detail.length > 0) {
      const primero = detail[0];
      const campo = Array.isArray(primero?.loc) ? primero.loc[primero.loc.length - 1] : null;
      const msg = typeof primero?.msg === 'string' ? primero.msg : null;
      if (campo && msg) return `Campo "${campo}": ${msg}`;
      if (msg) return msg;
    }
  } catch {
    // Cuerpo vacío, HTML de un proxy, o JSON malformado: se cae al mensaje
    // por status, que siempre existe.
  }
  return null;
}

/**
 * Mensaje final para mostrar en pantalla.
 *
 * `accion` describe qué se estaba intentando ("iniciar la inspección"), y se
 * antepone solo cuando el backend no mandó un detalle propio: si el servidor
 * ya explicó el problema, su texto manda — repetir el contexto lo empeora.
 */
export async function mensajeDeError(res: Response, accion: string): Promise<string> {
  const detalle = await leerDetalle(res);
  if (detalle) return detalle;

  const porStatus = POR_STATUS[res.status];
  if (porStatus) return `No se pudo ${accion}. ${porStatus}`;

  return `No se pudo ${accion} (error ${res.status}).`;
}

/**
 * Mensaje para fallos que no llegaron a tener respuesta (red caída, DNS, CORS,
 * el teléfono que se quedó sin señal a mitad del turno). `fetch` rechaza con
 * TypeError y no hay status que mirar.
 */
export function mensajeDeRed(accion: string): string {
  return `No se pudo ${accion}: sin conexión con el servidor. Revisá el WiFi y reintentá.`;
}
