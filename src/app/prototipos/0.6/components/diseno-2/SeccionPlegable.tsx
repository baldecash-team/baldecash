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
 * de tocar —ya fuera de la sección— no se mueva. En el celular el cierre se
 * anima (la altura se encoge en ~220 ms) y el scroll se corrige en cada
 * cuadro; en escritorio o con `prefers-reduced-motion`, se corrige de una.
 *
 * "Adentro" se decide con los eventos de React (foco y puntero), que también
 * llegan desde los portales: el calendario de `DateInput` y el tooltip "?" de
 * `FieldTooltip` se pintan fuera de la sección en el DOM, pero son parte de
 * ella.
 *
 * Los campos de una sección cerrada siguen montados (con `hidden`): conservan
 * su estado y la guía y la validación los siguen viendo.
 */

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Check } from 'lucide-react';
import { esPantallaDeCelular, prefiereMenosMovimiento } from './movimiento';
import { IconoDeSeccionV2 } from './IconoDeSeccionV2';

/** Evento DOM que abre una sección cerrada (lo dispara la guía de campos). */
export const EVENTO_ABRIR_SECCION = 'diseno2:abrir-seccion';

/** Selector de una sección cerrada (para la guía). */
export const SELECTOR_SECCION_CERRADA = '[data-seccion][data-cerrada="true"]';

/** Duración del cierre animado en el celular. */
export const DURACION_CIERRE_MS = 220;

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

/**
 * Deja `el` donde estaba (`topOriginal`, px desde arriba de la ventana)
 * moviendo el scroll lo que se haya corrido.
 */
export function compensarAncla(el: Element, topOriginal: number): void {
  if (!el.isConnected) return;
  const delta = el.getBoundingClientRect().top - topOriginal;
  if (delta !== 0) window.scrollBy?.(0, delta);
}

const ENFOCABLE =
  'input:not([type=hidden]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [role="button"][tabindex="0"], [tabindex="0"]';

export interface SeccionPlegableProps {
  /** Código de la sección (`groups[].code`): arma los ids. */
  codigo: string;
  titulo: string;
  /** `groups[].icon`: círculo con el ícono junto al título (prototipo). */
  icono?: string | null;
  /** `groups[].description`: línea gris bajo el título ("Donde vives ahora."). */
  descripcion?: string | null;
  /**
   * La sección tiene un solo campo y su etiqueta ES el título (Paso 4 del
   * prototipo: "¿Qué día del mes prefieres pagar?"). Abierta no repite el
   * título: la etiqueta del campo hace de título de la tarjeta.
   */
  tituloEnElCampo?: boolean;
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

interface Cierre {
  /** Lo que la persona tocó afuera: no se debe mover. */
  ancla: Element | null;
  top: number;
  /** Alto de la sección abierta, para animar desde ahí. */
  altoAntes: number;
}

export function SeccionPlegable({
  codigo,
  titulo,
  icono,
  descripcion,
  tituloEnElCampo = false,
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
  // Ya se cerró alguna vez: desde ahí, al reabrirse, el contenido entra con
  // un fundido corto (al montar el paso no, que ya entra la tarjeta entera).
  const [yaSeCerro, setYaSeCerro] = useState(false);
  if (cerrada && !yaSeCerro) setYaSeCerro(true);

  const raizRef = useRef<HTMLElement>(null);
  const estuvoDentroRef = useRef(false);
  // El foco está en algo de la sección (incluidos sus portales).
  const focoDentroRef = useRef(false);
  // Puntero abajo en cualquier lado (lo ve el documento) y puntero abajo en
  // la sección o sus portales (lo marca React, que ve el árbol de componentes).
  const punteroAbajoRef = useRef(false);
  const punteroDentroRef = useRef(false);
  const anclaDelPunteroRef = useRef<Element | null>(null);
  // Lo último para los oyentes del documento (se leen fuera del render).
  const completaRef = useRef(completa);
  const plegableRef = useRef(plegable);
  useLayoutEffect(() => {
    completaRef.current = completa;
    plegableRef.current = plegable;
  }, [completa, plegable]);
  const cierreRef = useRef<Cierre | null>(null);

  const idContenido = `seccion-${codigo}-contenido`;
  const idTitulo = `seccion-${codigo}-titulo`;

  const cerrarSiCorresponde = useCallback((ancla: Element | null) => {
    if (!estuvoDentroRef.current) return;
    estuvoDentroRef.current = false;
    const raiz = raizRef.current;
    if (!raiz || !plegableRef.current || !completaRef.current) return;
    // La que tiene el foco no se cierra.
    if (focoDentroRef.current) return;
    // Si lo tocado está en otra sección, se ancla esa sección: lo tocado
    // puede desaparecer (su "Editar" se va al abrirse).
    const anclaValida =
      ancla && !raiz.contains(ancla) && ancla.isConnected ? ancla.closest('[data-seccion]') ?? ancla : null;
    cierreRef.current = {
      ancla: anclaValida,
      top: anclaValida ? anclaValida.getBoundingClientRect().top : 0,
      altoAntes: raiz.getBoundingClientRect().height,
    };
    setCerradaPorSalir(true);
  }, []);

  // Salir con el puntero: se espera a que termine el clic, para que el botón
  // tocado no se mueva entre el pointerdown y el click. "Adentro" lo marca
  // `onPointerDownCapture` de la sección (React), que también recibe lo que
  // pasa en sus portales.
  useEffect(() => {
    if (!plegable) return;
    const alBajarPuntero = (e: PointerEvent) => {
      punteroAbajoRef.current = true;
      anclaDelPunteroRef.current = e.target instanceof Element ? e.target : null;
    };
    const alSubirPuntero = () => {
      if (!punteroAbajoRef.current) return;
      punteroAbajoRef.current = false;
      const dentro = punteroDentroRef.current;
      punteroDentroRef.current = false;
      const ancla = anclaDelPunteroRef.current;
      anclaDelPunteroRef.current = null;
      if (dentro || !ancla) return;
      window.setTimeout(() => cerrarSiCorresponde(ancla), 0);
    };
    document.addEventListener('pointerdown', alBajarPuntero, true);
    document.addEventListener('pointerup', alSubirPuntero, true);
    document.addEventListener('pointercancel', alSubirPuntero, true);
    return () => {
      document.removeEventListener('pointerdown', alBajarPuntero, true);
      document.removeEventListener('pointerup', alSubirPuntero, true);
      document.removeEventListener('pointercancel', alSubirPuntero, true);
    };
  }, [plegable, cerrarSiCorresponde]);

  // Salir con el teclado (Tab): el foco dejó la sección y no volvió a entrar.
  // Un foco que pasa a un portal de la sección vuelve a marcar `focoDentroRef`
  // antes de este chequeo.
  const alSalirElFoco = () => {
    focoDentroRef.current = false;
    if (!plegable) return;
    window.setTimeout(() => {
      if (focoDentroRef.current || punteroAbajoRef.current) return;
      const destino = document.activeElement;
      // Foco perdido (al body): no es salir hacia otro campo.
      if (!destino || destino === document.body) return;
      cerrarSiCorresponde(destino);
    }, 0);
  };

  // El campo que la persona acaba de tocar no se mueve de la pantalla.
  // Celular: la sección se encoge animada y el scroll se corrige en cada
  // cuadro. Escritorio o menos movimiento: se corrige de una.
  useLayoutEffect(() => {
    const cierre = cierreRef.current;
    cierreRef.current = null;
    const raiz = raizRef.current;
    if (!cerrada || !cierre || !raiz) return;
    const compensar = () => {
      if (cierre.ancla) compensarAncla(cierre.ancla, cierre.top);
    };
    const altoDespues = raiz.getBoundingClientRect().height;
    if (!esPantallaDeCelular() || prefiereMenosMovimiento() || !(cierre.altoAntes > altoDespues)) {
      compensar();
      return;
    }
    const limpiar = () => {
      raiz.style.height = '';
      raiz.style.overflow = '';
    };
    raiz.style.overflow = 'hidden';
    raiz.style.height = `${cierre.altoAntes}px`;
    const inicio = performance.now();
    let cuadro = 0;
    const paso = () => {
      const t = Math.min(1, (performance.now() - inicio) / DURACION_CIERRE_MS);
      const suave = 1 - Math.pow(1 - t, 3);
      raiz.style.height = `${cierre.altoAntes + (altoDespues - cierre.altoAntes) * suave}px`;
      compensar();
      if (t < 1) {
        cuadro = requestAnimationFrame(paso);
      } else {
        limpiar();
        compensar();
      }
    };
    cuadro = requestAnimationFrame(paso);
    // Se reabrió (o se desmontó) a mitad de la animación.
    return () => {
      cancelAnimationFrame(cuadro);
      limpiar();
    };
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
        ?.scrollIntoView?.({ block: 'center', behavior: prefiereMenosMovimiento() ? 'auto' : 'smooth' });
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
      aria-labelledby={tituloEnElCampo && !cerrada ? undefined : idTitulo}
      aria-label={tituloEnElCampo && !cerrada ? titulo : undefined}
      className="col-span-12 flex flex-col gap-4"
      onFocus={() => {
        focoDentroRef.current = true;
        estuvoDentroRef.current = true;
      }}
      onBlur={alSalirElFoco}
      onPointerDownCapture={() => {
        punteroDentroRef.current = true;
        estuvoDentroRef.current = true;
      }}
    >
      {/* El título es el mismo `h2` abierta o cerrada; cerrada suma el check,
          el resumen y "Editar" alrededor. */}
      <div
        // Cerrada: la línea de resumen entra con `bcPop` 0,25 s del prototipo.
        className={cerrada ? 'd2-pop flex items-center gap-3 py-1' : tituloEnElCampo ? 'hidden' : undefined}
        data-resumen-seccion={cerrada ? codigo : undefined}
      >
        {cerrada && (
          <span
            aria-hidden="true"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#E3F5F1] text-[#0E8C78]"
          >
            <Check className="h-[15px] w-[15px]" strokeWidth={3} />
          </span>
        )}
        {!cerrada && tituloEnElCampo ? null : !cerrada && (icono || descripcion) ? (
          // Abierta con ícono o descripción: círculo + título (+ línea gris),
          // como "Tus estudios" y "Dirección de tu casa" del prototipo.
          <div className="flex items-center gap-2.5">
            <IconoDeSeccionV2 nombre={icono} />
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 id={idTitulo} className="text-lg font-bold leading-snug text-[#1E2230]">
                {titulo}
              </h2>
              {descripcion && <p className="text-sm text-[#5B6275]">{descripcion}</p>}
            </div>
          </div>
        ) : (
        <div className={cerrada ? 'flex min-w-0 flex-grow flex-col gap-0.5' : undefined}>
          <h2
            id={idTitulo}
            className={cerrada
              ? 'text-[17px] font-bold leading-snug text-[#1E2230]'
              : 'text-lg font-bold leading-snug text-[#1E2230]'}
          >
            {titulo}
          </h2>
          {cerrada && (
            <p className="break-words text-sm text-[#5B6275] sm:truncate" title={resumen}>
              {resumen}
            </p>
          )}
        </div>
        )}
        {cerrada && (
          <button
            type="button"
            onClick={editar}
            aria-expanded={false}
            aria-controls={idContenido}
            aria-label={`Editar ${titulo}`}
            className="inline-flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded-lg px-1 text-sm font-semibold text-[color-mix(in_srgb,var(--color-primary-text)_80%,black)] underline underline-offset-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
          >
            Editar
          </button>
        )}
      </div>
      <div
        id={idContenido}
        hidden={cerrada}
        className={cerrada ? 'hidden' : `grid grid-cols-12 gap-x-3 gap-y-4${yaSeCerro ? ' d2-aparece' : ''}`}
      >
        {children}
      </div>
    </section>
  );
}

export default SeccionPlegable;
