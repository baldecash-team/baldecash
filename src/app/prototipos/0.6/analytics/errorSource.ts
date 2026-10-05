/**
 * Parseo del `source` de un error de JavaScript.
 *
 * Dos problemas que resuelve:
 *
 * 1. El recorte venía por la IZQUIERDA (`filename.slice(-100)`), así que en la
 *    base quedaban URLs como `tps://…` — inservibles. Si hay que recortar,
 *    se recorta por la derecha.
 * 2. Los bundles de Next.js tienen nombre por hash, así que la URL sola no
 *    dice nada: hay que cruzarla con el despliegue. El identificador del
 *    despliegue viaja en el parámetro `dpl` de la propia URL, y sale acá como
 *    campo suelto para no tener que parsearlo en cada consulta.
 */

/** Tope de la URL. Suficiente para cualquier ruta real de bundle. */
const MAX_SOURCE_LEN = 300;

export interface ParsedErrorSource {
  /** URL del archivo, sin el query string y sin recortar por la izquierda. */
  source?: string;
  /** Nombre del archivo (`2fccd770fe1ab1d1.js`). */
  file?: string;
  /** Identificador del despliegue (`dpl_…`), si la URL lo trae. */
  release?: string;
}

export function parseErrorSource(filename?: string | null): ParsedErrorSource {
  if (!filename) return {};

  let url: URL;
  try {
    url = new URL(filename);
  } catch {
    // No es una URL (`<anonymous>`, `eval`, extensiones): se reporta tal cual.
    return { source: filename.slice(0, MAX_SOURCE_LEN) };
  }

  const release = url.searchParams.get('dpl') || undefined;
  const file = url.pathname.split('/').pop() || undefined;
  const source = `${url.origin}${url.pathname}`.slice(0, MAX_SOURCE_LEN);

  return {
    source,
    ...(file ? { file } : {}),
    ...(release ? { release } : {}),
  };
}
