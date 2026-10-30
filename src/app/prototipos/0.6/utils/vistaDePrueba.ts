/**
 * Vista de prueba — «Probar en la web» desde el panel (BAL-5367).
 *
 * El panel genera un link personal (`/preview/{landing}?t=TOKEN`, firmado,
 * vence en 2 h) que abre el formulario real con un equipo elegido y las
 * respuestas llenas con datos de prueba. Desde ahí NUNCA se crea una
 * solicitud: el envío se simula como en el modo demo y, por si algún camino
 * se lo salta, el submit lleva la cabecera `X-Vista-Previa` y ws2 lo rechaza.
 *
 * La marca vive en `localStorage` y no en el `PreviewContext`
 * (`sessionStorage`) a propósito: las respuestas de prueba y el equipo viven en
 * `localStorage`, así que si alguien abre la landing en otra pestaña con esos
 * datos ya cargados, la marca tiene que seguir ahí para que tampoco se envíe.
 * Al vencer el link, la marca se borra junto con los datos de prueba de esa
 * landing: no queda un formulario lleno con el DNI de prueba que alguien pueda
 * enviar de verdad.
 */
import { clearProductStorage } from '../[landing]/solicitar/context/ProductContext';
import { clearWizardFormStorage } from '../[landing]/solicitar/context/WizardContext';
import { clearConsentStorage, saveConsentStorage } from '../[landing]/solicitar/utils/consentStorage';

const CLAVE = 'baldecash-vista-de-prueba';

/** Cabecera que ws2 rechaza en `/public/form/submit`. */
export const CABECERA_VISTA_PREVIA = 'X-Vista-Previa';

export interface VistaDePrueba {
  /** Landing donde se está probando. */
  slug: string;
  /** El link firmado: se reenvía para registrar el envío simulado. */
  token: string;
  /** Vencimiento (ms desde epoch). */
  venceEn: number;
  /** Faltan sembrar las respuestas de prueba (se hace una vez, con el config ya cargado). */
  sembrar: boolean;
  /** Para la franja: quién generó el link y cuándo vence, en palabras. */
  creadoPor?: string | null;
  venceTexto?: string | null;
}

function leerCruda(): VistaDePrueba | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return null;
    const v = JSON.parse(raw) as VistaDePrueba;
    if (typeof v?.slug !== 'string' || typeof v?.token !== 'string' || typeof v?.venceEn !== 'number') return null;
    return v;
  } catch {
    return null;
  }
}

export function guardarVistaDePrueba(v: VistaDePrueba): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(v));
  } catch {
    // Sin storage no hay marca: el candado de ws2 sigue rechazando el envío
    // solo si la cabecera viaja, así que sin storage no se siembra nada.
  }
}

/**
 * Quita la marca y los datos de prueba (respuestas, equipo, cupón) de esa
 * landing. Lo usan «Salir de la vista de prueba» y el vencimiento.
 */
export function salirDeVistaDePrueba(): void {
  const v = leerCruda();
  try { localStorage.removeItem(CLAVE); } catch { /* sin storage */ }
  if (!v) return;
  // Nunca tumba a quien llama (el submit lee la marca justo antes de enviar).
  // La casilla de términos que sembró el link (BAL-5381) no sobrevive a la
  // prueba: una visita normal arranca con ella sin marcar. Va primero y aparte
  // para que un fallo al borrar lo demás no la deje marcada.
  clearConsentStorage(v.slug);
  try {
    clearWizardFormStorage(v.slug);
    clearProductStorage(v.slug);
  } catch {
    // storage no disponible
  }
}

/**
 * La vista de prueba vigente, o null. Si `slug` viene, solo la de esa landing.
 * Vencida: se limpia (ver arriba) y devuelve null.
 */
export function leerVistaDePrueba(slug?: string | null, ahora: number = Date.now()): VistaDePrueba | null {
  const v = leerCruda();
  if (!v) return null;
  if (v.venceEn <= ahora) {
    salirDeVistaDePrueba();
    return null;
  }
  if (slug && v.slug !== slug) return null;
  return v;
}

/** true si en esta landing el envío se simula. */
export function esVistaDePrueba(slug?: string | null): boolean {
  return leerVistaDePrueba(slug) !== null;
}

/**
 * BAL-5381: en la vista de prueba la casilla «Acepto los Términos y la
 * Política de privacidad» (modal del carrito e intro de /solicitar) arranca
 * marcada, para recorrer el formulario sin tocarla. Se guarda en las mismas
 * claves que la casilla real; promociones queda sin marcar. Solo la llama el
 * link de prueba y `salirDeVistaDePrueba` la borra.
 */
export function sembrarTerminosDePrueba(slug: string): void {
  saveConsentStorage(slug, { acceptTerms: true, acceptPrivacy: true, acceptPromos: false });
}

export function marcarSembrada(): void {
  const v = leerCruda();
  if (v) guardarVistaDePrueba({ ...v, sembrar: false });
}

/**
 * Cabecera para el submit si hay una vista de prueba vigente (de cualquier
 * landing): segundo candado, ws2 rechaza el envío.
 */
export function cabecerasDeVistaDePrueba(): Record<string, string> {
  const v = leerVistaDePrueba();
  return v ? { [CABECERA_VISTA_PREVIA]: v.token } : {};
}
