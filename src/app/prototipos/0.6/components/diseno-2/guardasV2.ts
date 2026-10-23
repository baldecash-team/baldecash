/**
 * Las guardas del paso en Diseño 2 (BAL-4969, casuísticas).
 *
 * En Diseño 1, `StepClient` manda a `/solicitar` (la intro) cuando no hay
 * equipo, falta el cupón obligatorio, los plazos no coinciden, la cuota pasa
 * el tope o el equipo se quedó sin stock. En Diseño 2 esa intro no existe: la
 * persona se queda en el paso y ve un aviso con la salida que corresponde.
 *
 * Acá viven solo las reglas (puras, sin React): cuál guarda manda y qué dice.
 * El aviso lo dibuja `AvisoGuardaV2`.
 */

export type GuardaV2 =
  | { tipo: 'sin-producto' }
  | { tipo: 'sin-stock' }
  | { tipo: 'cupon' }
  | { tipo: 'plazos' }
  | { tipo: 'tope'; maximo: number; conProtecciones: boolean };

export interface EstadoDeGuardasV2 {
  /** El producto ya se leyó del storage (antes no se puede decir "no hay"). */
  productoHidratado: boolean;
  hayProducto: boolean;
  /** El envío ya salió bien: el carrito vacío es esperado, no una guarda. */
  enviado: boolean;
  hayNoDisponibles: boolean;
  /** La config del flujo ya cargó (antes no se sabe si el cupón es obligatorio). */
  flujoCargado: boolean;
  cuponObligatorio: boolean;
  hayCupon: boolean;
  plazosDistintos: boolean;
  sobreElTope: boolean;
  maximo: number;
  /** Hay protecciones (seguros) elegidas que suman a la cuota. */
  conProtecciones: boolean;
}

/**
 * La guarda que manda, o `null` si el paso puede seguir. El orden es el de la
 * gravedad: sin equipo no hay nada que revisar; sin stock no sirve tocar el
 * plazo; el cupón y los plazos se arreglan antes que la cuota.
 */
export function guardaActivaV2(e: EstadoDeGuardasV2): GuardaV2 | null {
  if (e.enviado) return null;
  if (e.productoHidratado && !e.hayProducto) return { tipo: 'sin-producto' };
  if (e.hayNoDisponibles) return { tipo: 'sin-stock' };
  if (e.flujoCargado && e.cuponObligatorio && !e.hayCupon) return { tipo: 'cupon' };
  if (e.plazosDistintos) return { tipo: 'plazos' };
  if (e.sobreElTope) return { tipo: 'tope', maximo: e.maximo, conProtecciones: e.conProtecciones };
  return null;
}

/** Qué hace el botón del aviso. */
export type AccionDeGuardaV2 = 'catalogo' | 'origen' | 'quitar-protecciones' | 'cambiar-plazo';

export interface TextoDeGuardaV2 {
  titulo: string;
  mensaje: string;
  accion: { texto: string; tipo: AccionDeGuardaV2 };
}

export function textoDeGuardaV2(g: GuardaV2): TextoDeGuardaV2 {
  switch (g.tipo) {
    case 'sin-producto':
      return {
        titulo: 'Todavía no elegiste tu equipo',
        mensaje: 'Para seguir con tu solicitud, elige primero el equipo que quieres financiar.',
        accion: { texto: 'Elegir un equipo', tipo: 'catalogo' },
      };
    case 'sin-stock':
      return {
        titulo: 'Ese equipo ya no está disponible',
        mensaje: 'Se agotó mientras completabas tu solicitud. Elige otro equipo para continuar.',
        accion: { texto: 'Elegir otro equipo', tipo: 'catalogo' },
      };
    case 'cupon':
      return {
        titulo: 'Falta tu cupón',
        mensaje: 'Esta solicitud necesita un cupón válido. Ingrésalo para continuar.',
        accion: { texto: 'Ingresar cupón', tipo: 'origen' },
      };
    case 'plazos':
      return {
        titulo: 'Tus equipos tienen plazos distintos',
        mensaje: 'Todos los equipos de una solicitud van con el mismo plazo. Vuelve a elegirlos para continuar.',
        accion: { texto: 'Cambiar plazo', tipo: 'catalogo' },
      };
    case 'tope':
      return g.conProtecciones
        ? {
            titulo: `Tu cuota pasa el límite de S/${g.maximo} al mes`,
            mensaje: 'Las protecciones que agregaste suben tu cuota por encima del límite. Quítalas para enviar tu solicitud.',
            accion: { texto: 'Quitar protecciones', tipo: 'quitar-protecciones' },
          }
        : {
            titulo: `Tu cuota pasa el límite de S/${g.maximo} al mes`,
            mensaje: 'Elige un plazo más largo o una cuota inicial mayor para bajarla.',
            accion: { texto: 'Cambiar plazo', tipo: 'cambiar-plazo' },
          };
  }
}

/**
 * ¿Agregar esta protección deja la cuota por encima del tope? Se pregunta
 * ANTES de agregarla: en el Paso 4 no se deja agregar algo que bloquea el
 * envío.
 */
export function proteccionPasaElTope(totalActual: number, precioDelPlan: number, maximo: number): boolean {
  if (!(maximo > 0)) return false;
  return totalActual + (precioDelPlan || 0) > maximo;
}

/** El texto que va junto a la protección que no se dejó agregar. */
export function textoDeTopeDelPlan(maximo: number): string {
  return `Con esta protección tu cuota pasa el límite de S/${maximo} al mes, así que no la podemos agregar.`;
}

/**
 * Evento con el que el aviso de tope abre "Cambiar plazo o inicial" del panel
 * "Tu solicitud" (escritorio) o de la cabecera (celular).
 */
export const EVENTO_ABRIR_PLAZO_V2 = 'diseno2:abrir-plazo';

export function pedirAbrirSelectorDePlazo(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(EVENTO_ABRIR_PLAZO_V2));
}
