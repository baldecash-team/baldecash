'use client';

/**
 * Guía de campos de Diseño 2 (BAL-4959): lleva la vista al campo que falta.
 *
 * - **arrive**: al llegar a un paso, baja al primer campo obligatorio visible y
 *   vacío y lo resalta con un brillo. No mueve el cursor ni abre el teclado.
 * - **goNextField**: al completar un campo de largo fijo (documento, celular),
 *   baja al siguiente pendiente. Mientras se escribe texto libre no hace nada.
 * - **goFin**: con todo completo, baja a "Continuar" y lo resalta.
 * - **Enter**: pasa al siguiente campo.
 *
 * Sirve para cualquier formulario de la BD: no conoce códigos de campo. Lee
 * los campos VISIBLES del DOM (`[data-campo]`, que pone `DynamicWizardStep`
 * en Diseño 2) en su orden, y de la config del paso solo toma si son
 * obligatorios y su tipo. La visibilidad (dependencias, prellenado) ya la
 * resolvió el render: repetirla acá sería una segunda copia de esa regla.
 *
 * Secciones (F5, BAL-4964): los campos de una sección cerrada siguen en el
 * DOM (ocultos) y en su orden. Están completos —por eso se cerró—, así que la
 * guía los salta y va a la siguiente sección abierta. Si el destino quedara
 * dentro de una cerrada, primero la abre y después lo resalta.
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWizard, FILE_PENDING_REUPLOAD } from '@/app/prototipos/0.6/[landing]/solicitar/context/WizardContext';
import { validateField, type WizardField, type WizardStep } from '@/app/prototipos/0.6/services/wizardApi';
import { abrirSeccionDe } from './SeccionPlegable';
import { prefiereMenosMovimiento } from './movimiento';

// ─── Parte pura (testeable sin DOM) ─────────────────────────────────────────

export interface CampoDeLaGuia {
  codigo: string;
  obligatorio: boolean;
  /** Sin valor (o casilla sin marcar). */
  vacio: boolean;
  /** El validador de siempre lo da por bueno. Vacío y opcional cuenta como válido. */
  valido: boolean;
}

export type DestinoDeLaGuia = { tipo: 'campo'; codigo: string } | { tipo: 'continuar' };

/** Un valor del formulario que cuenta como "no llenado". */
export function valorVacio(valor: unknown): boolean {
  if (valor === undefined || valor === null) return true;
  if (Array.isArray(valor)) return valor.length === 0;
  if (typeof valor === 'string') {
    const v = valor.trim();
    return v === '' || v === 'false' || v === FILE_PENDING_REUPLOAD;
  }
  return false;
}

/** Falta: obligatorio sin llenar, o llenado con algo que no pasa la validación. */
export function campoPendiente(c: CampoDeLaGuia): boolean {
  if (c.vacio) return c.obligatorio;
  return !c.valido;
}

/**
 * A dónde llevar a la persona. Con `despuesDe`, busca primero DESPUÉS de ese
 * campo (goNextField: no la devuelve hacia arriba) y si no queda nada abajo,
 * el primero pendiente de todo el paso. Sin pendientes: "Continuar".
 */
export function siguientePendiente(campos: CampoDeLaGuia[], despuesDe?: string): DestinoDeLaGuia {
  const desde = despuesDe ? campos.findIndex((c) => c.codigo === despuesDe) + 1 : 0;
  const orden = desde > 0 ? [...campos.slice(desde), ...campos.slice(0, desde)] : campos;
  const pendiente = orden.find((c) => c.codigo !== despuesDe && campoPendiente(c));
  return pendiente ? { tipo: 'campo', codigo: pendiente.codigo } : { tipo: 'continuar' };
}

/**
 * Campo de largo fijo: al completarlo ya no queda nada por escribir, así que
 * se puede bajar al siguiente sin interrumpir. Documento y celular por su tipo;
 * cualquier otro si su largo mínimo y máximo coinciden.
 */
export function esDeLargoFijo(field: Pick<WizardField, 'type' | 'min_length' | 'max_length'>): boolean {
  if (field.type === 'document_number' || field.type === 'phone') return true;
  return !!field.max_length && field.min_length === field.max_length;
}

// ─── Hook (DOM) ─────────────────────────────────────────────────────────────

const DURACION_BRILLO_MS = 1800;
/** El render tarda un poco en destapar campos (prellenado, dependencias). */
const ESPERA_AL_LLEGAR_MS = 450;
const ESPERA_TRAS_CAMBIO_MS = 200;
/** Un render para que la sección recién abierta pinte sus campos. */
const ESPERA_AL_ABRIR_SECCION_MS = 60;

const ENFOCABLE =
  'input:not([type=hidden]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Resalta un elemento y lo trae a la vista. No le da foco. */
export function resaltar(el: HTMLElement | null | undefined) {
  if (!el) return;
  el.scrollIntoView?.({ block: 'center', behavior: prefiereMenosMovimiento() ? 'auto' : 'smooth' });
  el.removeAttribute('data-guia');
  // Reiniciar la animación si ya estaba resaltado.
  void el.offsetWidth;
  el.setAttribute('data-guia', 'brillo');
  window.setTimeout(() => {
    if (el.getAttribute('data-guia') === 'brillo') el.removeAttribute('data-guia');
  }, DURACION_BRILLO_MS);
}

/**
 * Lleva el FOCO al control del campo, sin mover la pantalla (el scroll ya lo
 * hizo `resaltar`). BAL-4969, casuísticas: al apretar "Continuar" con un campo
 * mal, quien usa teclado o lector de pantalla se quedaba en el botón.
 */
export function enfocarCampoV2(codigo: string): void {
  if (typeof document === 'undefined') return;
  const contenedor = document.querySelector<HTMLElement>(`[data-campo="${CSS.escape(codigo)}"]`);
  const control = contenedor?.querySelector<HTMLElement>(ENFOCABLE) ?? document.getElementById(codigo);
  control?.focus({ preventScroll: true });
}

/** Espera para que una sección recién abierta pinte su campo antes del foco. */
const ESPERA_FOCO_MS = 80;

/**
 * El primer campo con error al apretar "Continuar" (Diseño 2): abre su
 * sección si estaba cerrada, lo trae a la vista con el brillo de la guía y le
 * da el foco.
 */
export function irAlPrimerErrorV2(codigo: string): void {
  if (typeof document === 'undefined') return;
  const el = document.querySelector<HTMLElement>(`[data-campo="${CSS.escape(codigo)}"]`);
  if (!el) {
    document.getElementById(codigo)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    enfocarCampoV2(codigo);
    return;
  }
  if (abrirSeccionDe(el)) {
    window.setTimeout(() => {
      resaltar(el);
      enfocarCampoV2(codigo);
    }, ESPERA_FOCO_MS);
    return;
  }
  resaltar(el);
  enfocarCampoV2(codigo);
}

function esVisible(el: HTMLElement): boolean {
  return el.offsetParent !== null || el.getClientRects().length > 0;
}

/**
 * A qué elemento resaltar para "Continuar": el primero VISIBLE de la lista de
 * botones, o si ninguno lo está, `zonaAcciones`. Nunca cae al primero "porque
 * sí" — con el teclado del celular abierto la barra fija se esconde
 * (`BarraInferiorV2`) y sin este guard caía en el botón de escritorio, oculto
 * por CSS en esa pantalla (BAL-4959, hallazgo de la revisión).
 */
export function elegirDestinoContinuar(
  botones: HTMLElement[],
  visible: (el: HTMLElement) => boolean,
  zonaAcciones: HTMLElement | null,
): HTMLElement | null {
  return botones.find(visible) ?? zonaAcciones;
}

/** El botón Continuar que se ve (escritorio o la barra fija de celular), o si
 * ninguno se ve, la zona de Atrás/Continuar (siempre pintada cuando hay
 * navegación). */
function botonContinuarVisible(): HTMLElement | null {
  const botones = Array.from(document.querySelectorAll<HTMLElement>('[data-continuar-v2]'));
  const zonaAcciones = document.querySelector<HTMLElement>('[data-zona-acciones-v2]');
  return elegirDestinoContinuar(botones, esVisible, zonaAcciones);
}

export interface OpcionesGuiaDeCampos {
  /** La tarjeta del paso: ahí adentro están los `[data-campo]`. */
  contenedorRef: React.RefObject<HTMLElement | null>;
  /** El paso actual. Sin paso (o apagada) la guía no hace nada. */
  step: WizardStep | null;
  activa?: boolean;
}

export function useGuiaDeCampos({ contenedorRef, step, activa = true }: OpcionesGuiaDeCampos) {
  const { formData, getAllDynamicOptions } = useWizard();

  const camposPorCodigo = useMemo(() => {
    const m = new Map<string, WizardField>();
    for (const f of step?.fields ?? []) m.set(f.code, f);
    return m;
  }, [step]);

  const formValues = useMemo(() => {
    const v: Record<string, string | string[]> = {};
    for (const [k, st] of Object.entries(formData)) {
      if (st?.value !== undefined) v[k] = st.value as string | string[];
    }
    return v;
  }, [formData]);

  // Lo más nuevo para los timers, sin re-armarlos en cada tecla.
  const valoresRef = useRef(formValues);
  useEffect(() => {
    valoresRef.current = formValues;
  }, [formValues]);

  const leerCampos = useCallback((): CampoDeLaGuia[] => {
    const raiz = contenedorRef.current;
    if (!raiz) return [];
    const valores = valoresRef.current;
    const opciones = getAllDynamicOptions();
    return Array.from(raiz.querySelectorAll<HTMLElement>('[data-campo]'))
      .map((el) => camposPorCodigo.get(el.dataset.campo ?? ''))
      .filter((f): f is WizardField => !!f)
      .map((f) => {
        const valor = valores[f.code];
        return {
          codigo: f.code,
          obligatorio: !!f.required,
          vacio: valorVacio(valor),
          // El campo está en pantalla: la visibilidad ya se resolvió.
          valido: validateField(f, valor, valores, opciones, true, { diseno2: true }).isValid,
        };
      });
  }, [contenedorRef, camposPorCodigo, getAllDynamicOptions]);

  const contenedorDe = useCallback(
    (codigo: string) =>
      contenedorRef.current?.querySelector<HTMLElement>(`[data-campo="${CSS.escape(codigo)}"]`) ?? null,
    [contenedorRef],
  );

  const irA = useCallback(
    (destino: DestinoDeLaGuia) => {
      if (destino.tipo === 'continuar') {
        resaltar(botonContinuarVisible());
        return;
      }
      const el = contenedorDe(destino.codigo);
      if (abrirSeccionDe(el)) window.setTimeout(() => resaltar(el), ESPERA_AL_ABRIR_SECCION_MS);
      else resaltar(el);
    },
    [contenedorDe],
  );

  // ── arrive (y goFin si el paso ya llega completo) ─────────────────────────
  const codigoPaso = step?.code ?? null;
  const habiaPendientesRef = useRef(false);
  const completosRef = useRef<Record<string, boolean>>({});
  const llegoRef = useRef<string | null>(null);
  useEffect(() => {
    if (!activa || !codigoPaso) return;
    llegoRef.current = null;
    const t = window.setTimeout(() => {
      const campos = leerCampos();
      if (campos.length === 0) return;
      const destino = siguientePendiente(campos);
      habiaPendientesRef.current = destino.tipo === 'campo';
      completosRef.current = Object.fromEntries(campos.map((c) => [c.codigo, !c.vacio && c.valido]));
      llegoRef.current = codigoPaso;
      irA(destino);
    }, ESPERA_AL_LLEGAR_MS);
    return () => window.clearTimeout(t);
  }, [activa, codigoPaso, leerCampos, irA]);

  // ── goNextField y goFin ───────────────────────────────────────────────────
  useEffect(() => {
    if (!activa || !codigoPaso) return;
    const t = window.setTimeout(() => {
      if (llegoRef.current !== codigoPaso) return; // todavía no llegó
      const campos = leerCampos();
      const antes = completosRef.current;
      const ahora: Record<string, boolean> = {};
      let recienCompletado: string | null = null;
      for (const c of campos) {
        const completo = !c.vacio && c.valido;
        ahora[c.codigo] = completo;
        const f = camposPorCodigo.get(c.codigo);
        if (!f || !esDeLargoFijo(f)) continue;
        // Solo si lo completó la persona escribiendo ahí: un prellenado no
        // tiene por qué mover la pantalla.
        const enfocado = contenedorDe(c.codigo)?.contains(document.activeElement) ?? false;
        if (completo && antes[c.codigo] === false && enfocado) recienCompletado = c.codigo;
      }
      completosRef.current = ahora;

      const destino = recienCompletado ? siguientePendiente(campos, recienCompletado) : siguientePendiente(campos);
      if (recienCompletado && destino.tipo === 'campo') irA(destino);
      if (destino.tipo === 'continuar' && habiaPendientesRef.current) irA(destino);
      habiaPendientesRef.current = destino.tipo === 'campo';
    }, ESPERA_TRAS_CAMBIO_MS);
    return () => window.clearTimeout(t);
  }, [activa, codigoPaso, formValues, leerCampos, camposPorCodigo, contenedorDe, irA]);

  // Al cambiar de paso se olvida lo que se sabía del anterior.
  useEffect(() => {
    completosRef.current = {};
    habiaPendientesRef.current = false;
  }, [codigoPaso]);

  // ── Enter ─────────────────────────────────────────────────────────────────
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (!activa || e.key !== 'Enter' || e.defaultPrevented) return;
      if (e.nativeEvent.isComposing || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement;
      // Texto largo: Enter es salto de línea. Listas abiertas: Enter elige.
      if (target.tagName !== 'INPUT') return;
      if (target.getAttribute('aria-expanded') === 'true') return;
      // El buscador de una lista desplegada usa Enter para elegir.
      if (target.closest('[role="listbox"], [aria-expanded="true"]')) return;
      const actual = target.closest<HTMLElement>('[data-campo]');
      if (!actual) return;
      e.preventDefault();

      const campos = leerCampos();
      const codigoActual = actual.dataset.campo ?? '';
      const destino = siguientePendiente(campos, codigoActual);
      if (destino.tipo === 'continuar') {
        resaltar(botonContinuarVisible());
        return;
      }
      // Enter sí mueve el foco: la persona ya está escribiendo.
      const el = contenedorDe(destino.codigo);
      const enfocar = () => {
        el?.querySelector<HTMLElement>(ENFOCABLE)?.focus({ preventScroll: true });
        resaltar(el);
      };
      if (abrirSeccionDe(el)) window.setTimeout(enfocar, ESPERA_AL_ABRIR_SECCION_MS);
      else enfocar();
    },
    [activa, leerCampos, contenedorDe],
  );

  return { onKeyDown };
}

export default useGuiaDeCampos;
