/**
 * Código de visitante: une las visitas de un mismo navegador.
 *
 * La sesión de tracking es UNA visita. Sin algo que sobreviva entre visitas,
 * quien entra el lunes desde Instagram y vuelve el jueves a pedir su laptop son
 * dos personas distintas, y la única forma de unirlas era el DNI — que aparece
 * en ~8 % de las sesiones.
 *
 * El código es un UUID al azar guardado en este navegador. Viaja en la columna
 * `session.fingerprint_hash`, que existía desde el inicio pero quedó vacía
 * (5 de 359 mil sesiones). Pese al nombre, NO es una huella del equipo: no mira
 * fuentes, pantalla ni nada del dispositivo, no dice nada de la persona y no
 * pide permisos. Si se borran los datos del navegador, la persona cuenta como
 * nueva; es aceptable para medir tendencias.
 *
 * Es global, no por landing: la misma persona que pasa de una landing a otra
 * sigue siendo la misma.
 *
 * Se reinicia cuando el equipo cambia de manos —link de otra promotora, otra
 * persona que se identifica—, en los mismos puntos donde se suelta la sesión de
 * tracking (`landingSession.ts`). Sin eso, todos los alumnos que pasan por la
 * tablet de un stand quedarían como un solo visitante.
 *
 * Nunca lanza: sin storage (Safari privado, previews de Apple Mail) devuelve
 * null y la sesión se crea sin código, como hasta hoy.
 */

const VISITOR_ID_KEY = 'baldecash-visitor-id';

function generarCodigo(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Código de visitante de este navegador; lo crea la primera vez.
 *
 * Devuelve null si no se puede guardar: un código que no persiste sería uno
 * distinto en cada carga, y eso inflaría los visitantes en vez de unirlos.
 */
export function obtenerCodigoDeVisitante(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const guardado = window.localStorage.getItem(VISITOR_ID_KEY);
    if (guardado) return guardado;
    const nuevo = generarCodigo();
    window.localStorage.setItem(VISITOR_ID_KEY, nuevo);
    return nuevo;
  } catch {
    return null;
  }
}

/**
 * Olvida el código: la próxima sesión nace con uno nuevo.
 *
 * Lo llama `landingSession.ts` en los resets que significan "llegó otra
 * persona". No lo llama la renovación tras enviar una solicitud: esa es la
 * misma persona arrancando otra.
 */
export function reiniciarCodigoDeVisitante(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(VISITOR_ID_KEY);
  } catch {
    // Storage no disponible: no hay nada que borrar.
  }
}
