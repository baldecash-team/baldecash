/**
 * El texto que se le muestra a la persona cuando el envío de la solicitud
 * falla (BAL-4969, casuísticas).
 *
 * ws2 no siempre manda `detail` como texto: un 422 de validación lo manda
 * como lista (`[{ campo, mensaje }]`) y el de titular menor como objeto
 * (`{ code, message }`). Pasar eso tal cual al aviso de Diseño 2 tumbaba la
 * pantalla (React no pinta objetos). Acá todo sale como un texto legible.
 *
 * - 5xx: nunca el texto técnico del servidor ("Internal Server Error").
 * - Lista: el primer `mensaje`, con "Revisa tus datos: ".
 * - Objeto: su `message` / `mensaje` / `error`.
 * - Nada usable: un texto según el status.
 */

export const MENSAJE_ERROR_GENERICO = 'No pudimos enviar tu solicitud. Por favor intenta nuevamente.';
export const MENSAJE_ERROR_SERVIDOR =
  'Tuvimos un problema de nuestro lado al enviar tu solicitud. Por favor intenta nuevamente en unos minutos.';
export const MENSAJE_ERROR_TIEMPO =
  'La conexión está tardando demasiado. Revisa tu internet e intenta nuevamente.';

/**
 * El envío salió del navegador pero no volvió una respuesta que diga cómo
 * terminó: la red se cortó, el tiempo máximo venció o el balanceador cerró la
 * conexión (502/503/504) mientras ws2 seguía trabajando.
 *
 * En ese caso la solicitud PUEDE haberse creado. Pasó en prod (BAL-4969,
 * 23-10-2026): ws2 tardó casi 4 minutos en el submit, el navegador recibió un
 * corte sin CORS, la pantalla dijo "Error de conexión. Por favor intenta
 * nuevamente", la persona reintentó y quedaron dos solicitudes (130342 y
 * 130343). Por eso el texto NO invita a reenviar enseguida.
 */
export const ERROR_CODE_ENVIO_SIN_CONFIRMAR = 'ENVIO_SIN_CONFIRMAR';
export const MENSAJE_ENVIO_SIN_CONFIRMAR =
  'No pudimos confirmar si tu solicitud llegó. Es posible que ya se haya ' +
  'registrado: no la envíes de nuevo todavía. Si se registró, te escribiremos ' +
  'por WhatsApp. Si en 10 minutos no tienes noticias, vuelve a intentarlo.';

/** Un error del código de la pantalla, no de la red. */
export const MENSAJE_ERROR_INESPERADO =
  'Tuvimos un problema inesperado al procesar tu solicitud. Por favor intenta nuevamente.';

function textoDe(valor: unknown): string | null {
  if (typeof valor === 'string') return valor.trim() || null;
  if (Array.isArray(valor)) {
    for (const item of valor) {
      const t = textoDe(item);
      if (t) return t;
    }
    return null;
  }
  if (valor && typeof valor === 'object') {
    const o = valor as Record<string, unknown>;
    for (const clave of ['mensaje', 'message', 'msg', 'error', 'detail']) {
      const t = textoDe(o[clave]);
      if (t) return t;
    }
  }
  return null;
}

/** `true` si el `detail` no es un texto (lista u objeto): vale la pena avisar a Sentry. */
export function detalleNoEsTexto(detail: unknown): boolean {
  return detail !== undefined && detail !== null && typeof detail !== 'string';
}

export function mensajeDelError(status: number, detail: unknown): string {
  if (status >= 500) return MENSAJE_ERROR_SERVIDOR;
  const texto = textoDe(detail);
  if (!texto) return status === 408 ? MENSAJE_ERROR_TIEMPO : MENSAJE_ERROR_GENERICO;
  if (Array.isArray(detail)) return `Revisa tus datos: ${texto}`;
  return texto;
}
