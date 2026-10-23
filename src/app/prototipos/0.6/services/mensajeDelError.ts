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
