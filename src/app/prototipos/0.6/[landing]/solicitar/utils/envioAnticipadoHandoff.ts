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
  /**
   * El contrato de esta solicitud YA se aceptó, en esta pestaña.
   *
   * Fuente de verdad de "firmó" para las gates de navegación de
   * `ContratoEnWizard`/`StepClient` (no se puede volver a un paso anterior del
   * wizard, ni al contrato en modo edición): a diferencia del KYC por ruta
   * dedicada, la variante wizard no tenía ninguna, así que al volver al
   * resumen tras firmar el contrato se pintaba como si nunca se hubiera
   * aceptado. `markEnvioAnticipadoContratoAceptado` es quien la prende;
   * `ContratoEnWizard` además la corrobora contra `/progress` para que
   * sobreviva a un refresh sin este handoff (u otro dispositivo).
   */
  contratoAceptado?: boolean;
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

/**
 * Marca el handoff de esta landing como "contrato aceptado", sin pisar el
 * resto de sus campos. No filtra por `sessionUuid`: se llama justo después de
 * aceptar, en la misma pestaña que acaba de leer este mismo handoff, así que
 * si ya no está (se limpió, o pertenece a otra sesión) no hay nada que marcar.
 */
export function markEnvioAnticipadoContratoAceptado(landing: string): void {
  try {
    const raw = sessionStorage.getItem(key(landing));
    if (!raw) return;
    const parsed = JSON.parse(raw) as EnvioAnticipadoHandoff;
    if (!parsed?.applicationCode) return;
    sessionStorage.setItem(key(landing), JSON.stringify({ ...parsed, contratoAceptado: true }));
  } catch {
    // sessionStorage no disponible: `ContratoEnWizard` igual corrobora contra
    // `/progress`, así que la fuente de verdad no depende solo de esto.
  }
}

/**
 * Apaga la marca de "contrato aceptado" sin pisar el resto del handoff.
 *
 * Existe porque `contratoAceptado` se prende OPTIMISTAMENTE al aceptar (antes
 * de que `/completar` confirme nada), y hay dos caminos donde legacy dice
 * después que ese contrato ya no vale (`contrato_vencido`, 409): el propio
 * accept puede volver "outdated" si el documento cambió entre que se mostró y
 * se aceptó, y `/completar` puede descubrirlo un paso más tarde. En los dos,
 * dejar la marca en `true` encerraría a quien tiene que volver a aceptar: las
 * gates de `StepClient` (Atrás, indicador de pasos, redirect por URL) la leen
 * para bloquear, y con un `true` viejo bloquearían para siempre un contrato
 * que en realidad quedó reabierto.
 */
export function clearEnvioAnticipadoContratoAceptado(landing: string): void {
  try {
    const raw = sessionStorage.getItem(key(landing));
    if (!raw) return;
    const parsed = JSON.parse(raw) as EnvioAnticipadoHandoff;
    if (!parsed?.applicationCode) return;
    sessionStorage.setItem(key(landing), JSON.stringify({ ...parsed, contratoAceptado: false }));
  } catch {
    // no-op
  }
}
