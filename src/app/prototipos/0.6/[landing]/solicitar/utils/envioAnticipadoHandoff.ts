/**
 * envioAnticipadoHandoff — la solicitud que ya existe, para las pantallas que
 * siguen dentro del wizard.
 *
 * Con envío anticipado la solicitud se crea al terminar una pantalla del medio,
 * y las siguientes tienen que poder hablar de ella: pedir el contrato, mostrarlo
 * y marcarlo aceptado. Necesitan su `code` y, para probar titularidad sin pedir
 * el DNI otra vez, el `resumeToken` que el submit acuñó.
 *
 * Va en `sessionStorage` y no en la URL por dos razones: el token es una prueba
 * de titularidad y no tiene por qué quedar en el historial ni en un `Referer`,
 * y el wizard navega entre pasos con rutas que ya existen y no se van a
 * ensuciar con query params.
 *
 * Sobrevive un refresh de la misma pestaña —que es justo lo que pasa cuando
 * alguien recarga mirando el contrato— y muere al cerrarla.
 *
 * Va atado a la sesión de tracking que lo creó. Sin esa atadura, un handoff de
 * una solicitud anterior hacía que el wizard creyera que ya había enviado y
 * pasara de largo el submit: la persona llenaba el formulario, apretaba
 * "Enviar" y la pantalla siguiente le mostraba el contrato de la solicitud
 * VIEJA, sin un solo POST de por medio. Pasó probando en local.
 */

export interface EnvioAnticipadoHandoff {
  /** `application_code` de la solicitud recién creada. */
  applicationCode: string;
  /** Prueba de titularidad emitida por el submit. Puede no venir: es best-effort. */
  resumeToken?: string;
  /** DNI capturado del formulario, para el caso sin token. */
  documentNumber?: string;
  /**
   * La landing tenía el sub-paso `contract` prendido cuando se envió: la
   * pantalla siguiente muestra el contrato y las condiciones quedan congeladas.
   *
   * Se guarda acá, y no se vuelve a consultar la config, para que quien
   * necesite saberlo —la barra del producto, por ejemplo— no arrastre un fetch
   * de configuración solo para pintar o no un selector.
   */
  conContrato?: boolean;
  /**
   * Sesión de tracking que creó la solicitud. Es la identidad del intento: si
   * la sesión de ahora es otra, este handoff es de una solicitud anterior.
   */
  sessionUuid?: string;
}

function key(landing: string): string {
  return `baldecash-${landing}-envio-anticipado`;
}

export function saveEnvioAnticipadoHandoff(
  landing: string,
  data: EnvioAnticipadoHandoff,
): void {
  try {
    sessionStorage.setItem(key(landing), JSON.stringify(data));
  } catch {
    // sessionStorage no disponible (SSR, modo privado con storage apagado).
    // El flujo degrada: la pantalla del contrato pedirá el DNI.
  }
}

/**
 * @param sessionUuid Sesión actual. Si se pasa, un handoff de otra sesión —o
 *   sin sesión anotada— se descarta: pertenece a una solicitud anterior.
 */
export function readEnvioAnticipadoHandoff(
  landing: string,
  sessionUuid?: string | null,
): EnvioAnticipadoHandoff | null {
  try {
    const raw = sessionStorage.getItem(key(landing));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EnvioAnticipadoHandoff;
    // Sin código no hay nada que mostrar: un handoff a medias es peor que
    // ninguno, porque la pantalla creería que tiene solicitud.
    if (typeof parsed?.applicationCode !== 'string' || !parsed.applicationCode) {
      return null;
    }
    if (sessionUuid && parsed.sessionUuid !== sessionUuid) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearEnvioAnticipadoHandoff(landing: string): void {
  try {
    sessionStorage.removeItem(key(landing));
  } catch {
    // no-op
  }
}
