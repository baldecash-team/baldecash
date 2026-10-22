'use client';

/**
 * Sección de un paso en Diseño 2 (BAL-4964, F5). F6 la reutiliza.
 *
 * - Siempre: agrupa sus campos bajo un título.
 * - Si es plegable: cuando la sección está `completa` (todos sus obligatorios
 *   visibles llenos y válidos, lo calcula quien la usa) y el foco SALE de ella,
 *   se cierra. Queda una línea con el título, el `resumen` y "Editar", que la
 *   reabre y pone el foco en su primer campo.
 * - La sección que tiene el foco nunca se cierra.
 * - Con `conError` (se intentó continuar con errores adentro) se abre sola.
 * - Si deja de estar completa (una dependencia destapó otro obligatorio), se
 *   abre sola.
 * - La guía de campos le pide abrirse con el evento `EVENTO_ABRIR_SECCION`.
 *
 * Al cerrarse, la pantalla se corrige para que el campo que la persona acaba
 * de tocar —ya fuera de la sección— no se mueva.
 *
 * Los campos de una sección cerrada siguen montados (con `hidden`): conservan
 * su estado y la guía y la validación los siguen viendo.
 */

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Check } from 'lucide-react';

/** Evento DOM que abre una sección cerrada (lo dispara la guía de campos). */
export const EVENTO_ABRIR_SECCION = 'diseno2:abrir-seccion';

/** Selector de una sección cerrada (para la guía). */
export const SELECTOR_SECCION_CERRADA = '[data-seccion][data-cerrada="true"]';

/**
 * Si `el` está dentro de una sección cerrada, la abre y devuelve `true`.
 * La guía espera un render antes de resaltar el campo.
 */
export function abrirSeccionDe(el: Element | null | undefined): boolean {
  const seccion = el?.closest(SELECTOR_SECCION_CERRADA);
  if (!seccion) return false;
  seccion.dispatchEvent(new CustomEvent(EVENTO_ABRIR_SECCION));
  return true;
}

const ENFOCABLE =
  'input:not([type=hidden]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [role="button"][tabindex="0"], [tabindex="0"]';

export interface SeccionPlegableProps {
  /** Código de la sección (`groups[].code`): arma los ids. */
  codigo: string;
  titulo: string;
  /** `groups[].is_collapsible`. Sin esto solo agrupa. */
  plegable: boolean;
  /** Todos sus obligatorios visibles llenos y todo lo escrito válido. */
  completa: boolean;
  /** Valores mostrados separados por " · ". */
  resumen: string;
  /** Hay un error visible adentro: se abre sola. */
  conError?: boolean;
  children: React.ReactNode;
}

export function SeccionPlegable({
  codigo,
  titulo,
  plegable,
  completa,
  resumen,
  conError = false,
  children,
}: SeccionPlegableProps) {
  const [cerradaPorSalir, setCerradaPorSalir] = useState(false);
  // Abierta por un error o porque le falta algo: queda abierta (no vuelve a
  // cerrarse sola al corregir; se cierra otra vez al salir). Ajuste durante
  // el render, el patrón de React para derivar de props.
  if (cerradaPorSalir && (conError || !completa)) setCerradaPorSalir(false);
  const cerrada = plegable && cerradaPorSalir && completa && !conError;

  const raizRef = useRef<HTMLElement>(null);
  const estuvoDentroRef = useRef(false);
  // Lo último para los oyentes del documento (se leen fuera del render).
  const completaRef = useRef(completa);
  const plegableRef = useRef(plegable);
  useLayoutEffect(() => {
    completaRef.current = completa;
    plegableRef.current = plegable;
  }, [completa, plegable]);
  // Elemento que no se debe mover al cerrar, y dónde estaba.
  const anclaRef = useRef<{ el: Element; top: number } | null>(null);

  const idContenido = `seccion-${codigo}-contenido`;
  const idTitulo = `seccion-${codigo}-titulo`;

  const cerrarSiCorresponde = useCallback((ancla: Element | null) => {
    if (!estuvoDentroRef.current) return;
    estuvoDentroRef.current = false;
    const raiz = raizRef.current;
    if (!raiz || !plegableRef.current || !completaRef.current) return;
    // La que tiene el foco no se cierra.
    if (document.activeElement && raiz.contains(document.activeElement)) return;
    if (ancla && !raiz.contains(ancla) && ancla.isConnected) {
      anclaRef.current = { el: ancla, top: ancla.getBoundingClientRect().top };
    } else {
      anclaRef.current = null;
    }
    setCerradaPorSalir(true);
  }, []);

  // Salir de la sección: el foco va a otro lado (Tab) o la persona toca
  // afuera. Con el puntero se espera a que termine el clic, para que el
  // botón tocado no se mueva entre el pointerdown y el click.
  useEffect(() => {
    if (!plegable) return;
    let punteroAbajo = false;
    let anclaDelPuntero: Element | null = null;
    const fuera = (t: EventTarget | null) =>
      t instanceof Node && !!raizRef.current && !raizRef.current.contains(t);

    const alBajarPuntero = (e: PointerEvent) => {
      punteroAbajo = true;
      anclaDelPuntero = fuera(e.target) ? (e.target as Element) : null;
    };
    const alSubirPuntero = () => {
      if (!punteroAbajo) return;
      punteroAbajo = false;
      const ancla = anclaDelPuntero;
      anclaDelPuntero = null;
      if (!ancla) return;
      window.setTimeout(() => cerrarSiCorresponde(ancla), 0);
    };
    const alEnfocar = (e: FocusEvent) => {
      if (punteroAbajo || !fuera(e.target)) return;
      cerrarSiCorresponde(e.target as Element);
    };
    document.addEventListener('pointerdown', alBajarPuntero, true);
    document.addEventListener('pointerup', alSubirPuntero, true);
    document.addEventListener('pointercancel', alSubirPuntero, true);
    document.addEventListener('focusin', alEnfocar, true);
    return () => {
      document.removeEventListener('pointerdown', alBajarPuntero, true);
      document.removeEventListener('pointerup', alSubirPuntero, true);
      document.removeEventListener('pointercancel', alSubirPuntero, true);
      document.removeEventListener('focusin', alEnfocar, true);
    };
  }, [plegable, cerrarSiCorresponde]);

  // El campo que la persona acaba de tocar no se mueve de la pantalla.
  useLayoutEffect(() => {
    const ancla = anclaRef.current;
    anclaRef.current = null;
    if (!cerrada || !ancla || !ancla.el.isConnected) return;
    const delta = ancla.el.getBoundingClientRect().top - ancla.top;
    if (delta !== 0) window.scrollBy?.(0, delta);
  }, [cerrada]);

  // Pedido de la guía de campos: abrir.
  useEffect(() => {
    const raiz = raizRef.current;
    if (!raiz) return;
    const abrir = () => setCerradaPorSalir(false);
    raiz.addEventListener(EVENTO_ABRIR_SECCION, abrir);
    return () => raiz.removeEventListener(EVENTO_ABRIR_SECCION, abrir);
  }, []);

  // Si se abrió por error al continuar, traerla a la vista.
  const estabaCerradaRef = useRef(cerrada);
  useEffect(() => {
    if (estabaCerradaRef.current && !cerrada && conError) {
      raizRef.current
        ?.querySelector<HTMLElement>('[data-estado="error"]')
        ?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    }
    estabaCerradaRef.current = cerrada;
  }, [cerrada, conError]);

  // "Editar": abre y pone el foco en el primer campo (ya pintado).
  const editar = () => {
    flushSync(() => setCerradaPorSalir(false));
    document.getElementById(idContenido)?.querySelector<HTMLElement>(ENFOCABLE)?.focus();
  };

  return (
    <section
      ref={raizRef}
      data-seccion={codigo}
      data-cerrada={cerrada ? 'true' : 'false'}
      aria-labelledby={idTitulo}
      className="col-span-12 flex flex-col gap-4"
      onFocusCapture={() => {
        estuvoDentroRef.current = true;
      }}
      onPointerDownCapture={() => {
        estuvoDentroRef.current = true;
      }}
    >
      {cerrada ? (
        <div className="flex items-center gap-3 py-1" data-resumen-seccion={codigo}>
          <span
            aria-hidden="true"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#E3F5F1] text-[#0E8C78]"
          >
            <Check className="h-[15px] w-[15px]" strokeWidth={3} />
          </span>
          <span className="flex min-w-0 flex-grow flex-col gap-0.5">
            <span id={idTitulo} className="text-[17px] font-bold leading-snug text-[#1E2230]">
              {titulo}
            </span>
            <span className="break-words text-sm text-[#5B6275] sm:truncate" title={resumen}>
              {resumen}
            </span>
          </span>
          <button
            type="button"
            onClick={editar}
            aria-expanded={false}
            aria-controls={idContenido}
            aria-label={`Editar ${titulo}`}
            className="inline-flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded-lg px-1 text-sm font-semibold text-[#3341B8] underline underline-offset-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4654CD] focus-visible:ring-offset-2"
          >
            Editar
          </button>
        </div>
      ) : (
        <h2 id={idTitulo} className="text-lg font-bold leading-snug text-[#1E2230]">
          {titulo}
        </h2>
      )}
      <div id={idContenido} hidden={cerrada} className={cerrada ? 'hidden' : 'grid grid-cols-12 gap-y-4'}>
        {children}
      </div>
    </section>
  );
}

export default SeccionPlegable;
