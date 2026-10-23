'use client';

/**
 * De dónde volver en el Paso 1 de Diseño 2 (BAL-4959, decisión del
 * controlador en la revisión de F1).
 *
 * Hoy "Atrás" en el Paso 1 va a `/solicitar` —la pantalla intermedia de
 * Diseño 1— pero esa pantalla no existe en Diseño 2: la persona entró por el
 * modal "Lo quiero" desde el catálogo o la ficha del producto. "Atrás" tiene
 * que volver AHÍ, no a una pantalla que nunca vio.
 *
 * El modal guarda la URL (pathname + search) justo antes de navegar al
 * primer paso —ahí todavía es la del catálogo o la ficha—, con una clave por
 * landing en `sessionStorage`: sobrevive el resto del wizard (no se borra al
 * avanzar de paso) y no se mezcla entre landings si la persona tiene dos
 * pestañas abiertas. Con Diseño 1 nada de esto se usa.
 */

function clave(landing: string): string {
  return `baldecash-${landing}-diseno2-origen`;
}

/**
 * Guarda la página actual como el origen del modal. Se llama justo antes de
 * navegar al primer paso, así que "actual" es todavía el catálogo o la
 * ficha.
 */
export function guardarOrigenDiseno2(landing: string): void {
  try {
    sessionStorage.setItem(clave(landing), `${window.location.pathname}${window.location.search}`);
  } catch {
    // Sin sessionStorage (modo privado, SSR) el Paso 1 cae al catálogo —ver
    // `leerOrigenDiseno2`—, que sigue siendo mejor que `/solicitar`.
  }
}

/**
 * La ruta guardada, o `null` si no hay (URL directa al paso, otra pestaña, o
 * `sessionStorage` no disponible). Sin ella, "Atrás" cae al catálogo de la
 * landing.
 *
 * Solo rutas internas (re-revisión de BAL-4959): tiene que empezar con `/` y
 * NO con `//` (eso es protocol-relative, o sea una URL externa disfrazada de
 * ruta — `//evil.com` navega fuera de BaldeCash). Cualquier otra cosa
 * guardada —una URL absoluta, o lo que sea— se descarta y cae al catálogo.
 */
export function leerOrigenDiseno2(landing: string): string | null {
  try {
    const guardado = sessionStorage.getItem(clave(landing));
    if (!guardado || !guardado.startsWith('/') || guardado.startsWith('//')) return null;
    return guardado;
  } catch {
    return null;
  }
}

export default guardarOrigenDiseno2;

/*
 * La puerta por la que se entró a `/solicitar` sin pasar por la card ni la
 * ficha (comparador, "Retomar", calculadora, copia-home, quiz…), BAL-4969
 * casuísticas. En Diseño 2 `/solicitar` abre el modal "Lo quiero" y, si la
 * persona lo cierra, vuelve acá. Va en su propia clave: el modal pisa la de
 * arriba con `/solicitar` al continuar (para que "Atrás" del Paso 1 vuelva al
 * modal), y sin esta el modal no sabría a dónde salir.
 */
function claveEntrada(landing: string): string {
  return `baldecash-${landing}-diseno2-entrada`;
}

/** Guarda la página actual como la puerta de entrada a `/solicitar`. */
export function guardarEntradaALaSolicitud(landing: string): void {
  try {
    sessionStorage.setItem(claveEntrada(landing), `${window.location.pathname}${window.location.search}`);
  } catch {
    // Sin storage: al cerrar el modal se cae al catálogo.
  }
}

/** La puerta guardada (solo rutas internas y que no sean `/solicitar`), o `null`. */
export function leerEntradaALaSolicitud(landing: string): string | null {
  try {
    const guardado = sessionStorage.getItem(claveEntrada(landing));
    if (!guardado || !guardado.startsWith('/') || guardado.startsWith('//')) return null;
    if (/\/solicitar(\/|\?|$)/.test(guardado)) return null;
    return guardado;
  } catch {
    return null;
  }
}
