/**
 * Llaves de identidad del URL (`rid`, `vip_auto`, `alk`…) — F2 de campañas.
 *
 * La web no decide qué llaves existen: se lo dice el backend en el config de la
 * landing (`config.tracking.query_keys`, que sale de `system_config`). Una llave
 * nueva se prende sin deploy de la web.
 *
 * Como el config llega después (y la sesión de tracking también), las llaves se
 * GUARDAN en el primer render, con el URL todavía intacto, y se mandan cuando hay
 * sesión. Se guarda el querystring entero: cuál vale se decide con el config.
 *
 * R9: el `rid` se borra del URL apenas se leyó, para que un pantallazo o un link
 * copiado no lo exponga. `vip_auto` y `alk` se quedan: los siguen leyendo la
 * puerta de la lista blanca y la sesión.
 */

export const LLAVES_POR_DEFECTO = ['rid', 'vip_auto', 'alk'];

/** Llaves que otros flujos de la web leen del URL: nunca se borran acá. */
const LLAVES_QUE_SE_QUEDAN = ['vip_auto', 'alk'];

const clave = (landing: string) => `baldecash-llaves-pendientes-${landing}`;

export function leerLlavesPendientes(landing: string): Record<string, string> {
  try {
    const crudo = sessionStorage.getItem(clave(landing));
    const valor: unknown = crudo ? JSON.parse(crudo) : {};
    return valor && typeof valor === 'object' ? (valor as Record<string, string>) : {};
  } catch {
    // Guardado roto o sin sessionStorage: se lee como que no hay nada.
    return {};
  }
}

export function capturarLlavesDelUrl(landing: string, search: string): void {
  const nuevas: Record<string, string> = {};
  new URLSearchParams(search).forEach((valor, nombre) => {
    if (valor.trim()) nuevas[nombre] = valor.trim();
  });
  if (!Object.keys(nuevas).length) return;
  try {
    // Un link fresco pisa lo guardado: es un acto explícito de identidad.
    sessionStorage.setItem(clave(landing), JSON.stringify({ ...leerLlavesPendientes(landing), ...nuevas }));
  } catch {
    // Sin sessionStorage (modo privado estricto) no hay dónde guardar: la
    // visita queda sin atar, como antes de F2.
  }
}

export function limpiarLlavesPendientes(landing: string): void {
  try {
    sessionStorage.removeItem(clave(landing));
  } catch {
    // Sin sessionStorage no hay nada que limpiar.
  }
}

export function elegirLlaves(pendientes: Record<string, string>, activas: string[]): Record<string, string> {
  const elegidas: Record<string, string> = {};
  activas.forEach((nombre) => {
    if (pendientes[nombre]) elegidas[nombre] = pendientes[nombre];
  });
  return elegidas;
}

export function llavesActivas(config: unknown): string[] {
  const lista = (config as { tracking?: { query_keys?: unknown } } | null)?.tracking?.query_keys;
  if (!Array.isArray(lista)) return LLAVES_POR_DEFECTO;
  const limpias = lista.filter((x): x is string => typeof x === 'string' && x.trim() !== '');
  return limpias.length ? limpias : LLAVES_POR_DEFECTO;
}

export function quitarLlavesDelUrl(llaves: string[]): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  let cambio = false;
  llaves.forEach((nombre) => {
    if (!LLAVES_QUE_SE_QUEDAN.includes(nombre) && url.searchParams.has(nombre)) {
      url.searchParams.delete(nombre);
      cambio = true;
    }
  });
  if (cambio) window.history.replaceState(window.history.state, '', url.toString());
}
