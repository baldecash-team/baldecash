'use client';

/**
 * Modal base de Diseño 2 (BAL-5203, punto 10): el estándar del modal
 * «Detalle del financiamiento» de la ficha del producto, para todos los
 * modales del kit («Lo quiero», cupón, «Ver detalle» del accesorio, «¿Qué
 * cubre?» del seguro y los avisos).
 *
 * - Escritorio: ventana centrada `rounded-2xl` sobre fondo con blur. Arriba
 *   la franja del color de la landing con el ícono en un cuadro translúcido,
 *   título y subtítulo, y el cerrar redondo de 28 px. Entra con fade + scale.
 * - Celular: hoja que sube desde abajo (curva de resorte) con la manija para
 *   arrastrar; arrastrarla (o la franja) más de 100 px hacia abajo la cierra.
 *   La franja va dentro como tarjeta `mx-4 rounded-xl`.
 * - Cuerpo con scroll y pie opcional (Cerrar + acción principal).
 *
 * Accesibilidad: `role="dialog"` + `aria-modal`, foco adentro al abrir,
 * atrapado con Tab, Escape cierra y el foco vuelve a quien lo abrió. Los
 * modales se apilan (el cupón encima de «Lo quiero»): Escape y Tab son solo
 * del de más arriba. Con `prefers-reduced-motion` no hay animación.
 *
 * Salida: el padre pone `abierto={false}` y el modal se queda montado lo que
 * dura su animación de salida; recién ahí avisa `onSalidaTerminada`.
 *
 * Colores: los tokens `--d2-*` (en la landing oscura, la franja usa el
 * primario oscurecido de `--d2-cabecera-inicio` con texto blanco).
 */

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { DURACION_SALIDA_MS, prefiereMenosMovimiento } from './movimiento';
import { ZONA_TACTIL_44 } from './zonaTactil';

export type MotivoCierreV2 = 'escape' | 'fondo' | 'x' | 'arrastre';

/** Arrastrar la hoja hacia abajo más de esto (px) la cierra, en celular. */
export const UMBRAL_ARRASTRE_V2 = 100;

const ANCHOS = {
  chico: 'md:max-w-[420px]',
  mediano: 'md:max-w-[500px]',
  grande: 'md:max-w-[880px]',
} as const;

const ENFOCABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Botones del pie, iguales en todos los modales (zona táctil de 44 px o más). */
export const BOTON_SECUNDARIO_V2 =
  'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-[1.5px] border-[var(--d2-borde-campo)] bg-[var(--d2-tarjeta)] px-5 text-[15px] font-semibold text-[var(--d2-texto)] cursor-pointer transition-colors duration-150 hover:bg-[var(--d2-gris-suave)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]';
export const BOTON_PRIMARIO_V2 =
  'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-[15px] font-bold text-[var(--color-on-primary)] cursor-pointer transition-colors duration-150 hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]';

/** Pila de modales abiertos: solo el de arriba atiende Escape y Tab. */
const pila: symbol[] = [];

function esCelular(): boolean {
  try {
    return window.matchMedia('(max-width: 767px)').matches;
  } catch {
    return false;
  }
}

export interface ModalV2Props {
  abierto: boolean;
  /** Pedido de cierre (X, fondo, Escape o arrastre). El padre decide. */
  onCerrar: (motivo: MotivoCierreV2) => void;
  /** Terminó la animación de salida (o no hubo, con menos movimiento). */
  onSalidaTerminada?: () => void;
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  icono: React.ElementType;
  children: React.ReactNode;
  pie?: React.ReactNode;
  ancho?: keyof typeof ANCHOS;
  /** `aria-label` del botón de cerrar de la franja. */
  etiquetaCerrar?: string;
  idTitulo?: string;
  idSubtitulo?: string;
  /**
   * A dónde vuelve el foco al cerrar, si no es a quien lo abrió (p. ej. un
   * botón que se vuelve a pintar). Se busca después del render.
   */
  devolverFoco?: () => HTMLElement | null;
  /** Selector del elemento que recibe el foco al abrir (por defecto, el diálogo). */
  enfoqueInicial?: string;
  /** z-index de la capa (un modal encima de otro va más arriba). */
  capa?: number;
  claseCuerpo?: string;
  clasePie?: string;
  /** Atributos extra del diálogo (`data-*`). */
  datos?: Record<`data-${string}`, string | boolean | undefined>;
}

export function ModalV2(props: ModalV2Props) {
  const { abierto, onSalidaTerminada } = props;
  const [montado, setMontado] = useState(abierto);
  const [saliendo, setSaliendo] = useState(false);
  // Se vuelve a abrir mientras salía: vuelve a entrar.
  if (abierto && (!montado || saliendo)) {
    setMontado(true);
    setSaliendo(false);
  }
  const alTerminarRef = useRef(onSalidaTerminada);
  alTerminarRef.current = onSalidaTerminada;

  useEffect(() => {
    if (abierto || !montado) return;
    if (prefiereMenosMovimiento()) {
      setMontado(false);
      alTerminarRef.current?.();
      return;
    }
    setSaliendo(true);
    const t = window.setTimeout(() => {
      setSaliendo(false);
      setMontado(false);
      alTerminarRef.current?.();
    }, DURACION_SALIDA_MS);
    return () => window.clearTimeout(t);
  }, [abierto, montado]);

  if (!montado || typeof document === 'undefined') return null;
  return createPortal(<PanelModalV2 {...props} saliendo={saliendo} />, document.body);
}

function PanelModalV2({
  onCerrar,
  titulo,
  subtitulo,
  icono: Icono,
  children,
  pie,
  ancho = 'mediano',
  etiquetaCerrar = 'Cerrar',
  idTitulo: idTituloProp,
  idSubtitulo: idSubtituloProp,
  enfoqueInicial,
  devolverFoco,
  capa = 1000,
  claseCuerpo,
  clasePie,
  datos,
  saliendo,
}: ModalV2Props & { saliendo: boolean }) {
  const idAuto = useId();
  const idTitulo = idTituloProp ?? `modal-v2-titulo-${idAuto}`;
  const idSubtitulo = idSubtituloProp ?? `modal-v2-subtitulo-${idAuto}`;
  const panelRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef(onCerrar);
  cerrarRef.current = onCerrar;
  const devolverFocoRef = useRef(devolverFoco);
  devolverFocoRef.current = devolverFoco;
  const saliendoRef = useRef(saliendo);
  saliendoRef.current = saliendo;

  // ── Foco, Escape, Tab y scroll del fondo ─────────────────────────────────
  useEffect(() => {
    const yo = Symbol('modal-v2');
    pila.push(yo);
    const anterior = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const inicial = enfoqueInicial ? panel?.querySelector<HTMLElement>(enfoqueInicial) : null;
    (inicial ?? panel)?.focus({ preventScroll: true });
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const alTeclear = (e: KeyboardEvent) => {
      if (pila[pila.length - 1] !== yo || !panel) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (!saliendoRef.current) cerrarRef.current('escape');
        return;
      }
      if (e.key !== 'Tab') return;
      const todos = Array.from(panel.querySelectorAll<HTMLElement>(ENFOCABLE));
      // Lo oculto por CSS (p. ej. un botón solo de escritorio) no recibe foco.
      const visibles = todos.filter((n) => n.offsetParent !== null);
      const nodos = visibles.length > 0 ? visibles : todos;
      if (nodos.length === 0) {
        e.preventDefault();
        return;
      }
      const primero = nodos[0];
      const ultimo = nodos[nodos.length - 1];
      const activo = document.activeElement;
      if (e.shiftKey && (activo === primero || activo === panel)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault();
        primero.focus();
      } else if (!panel.contains(activo)) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('keydown', alTeclear);
      const i = pila.indexOf(yo);
      if (i >= 0) pila.splice(i, 1);
      document.body.style.overflow = overflowPrevio;
      const destino = devolverFocoRef.current;
      // En desarrollo, StrictMode desmonta y vuelve a montar el efecto: si el
      // diálogo sigue en la página no se cerró, y el foco se queda adentro.
      if (destino) requestAnimationFrame(() => {
        if (!panel?.isConnected) destino()?.focus({ preventScroll: true });
      });
      else if (anterior?.isConnected) anterior.focus?.({ preventScroll: true });
    };
    // Una vez por apertura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Celular: teclado abierto (el campo no puede quedar tapado) ───────────
  // `dvh` no se encoge con el teclado en todos los navegadores: se mide el
  // viewport visible y la hoja sube por encima del teclado.
  const [teclado, setTeclado] = useState<{ alto: number; visible: number } | null>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const medir = () => {
      const tapado = window.innerHeight - vv.height - vv.offsetTop;
      setTeclado(tapado > 80 ? { alto: tapado, visible: vv.height } : null);
    };
    vv.addEventListener('resize', medir);
    vv.addEventListener('scroll', medir);
    return () => {
      vv.removeEventListener('resize', medir);
      vv.removeEventListener('scroll', medir);
    };
  }, []);

  // ── Celular: arrastrar la manija (o la franja) hacia abajo cierra ────────
  // Solo la parte de arriba es arrastrable, así el scroll del cuerpo no se toca.
  const [arrastre, setArrastre] = useState(0);
  const inicioArrastre = useRef<number | null>(null);
  const arrastreRef = useRef(0);
  const alEmpezarArrastre = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!esCelular() || (e.target as HTMLElement).closest('button, a')) return;
    inicioArrastre.current = e.clientY;
    arrastreRef.current = 0;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, []);
  const alArrastrar = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (inicioArrastre.current === null) return;
    const d = Math.max(0, e.clientY - inicioArrastre.current);
    arrastreRef.current = d;
    setArrastre(d);
  }, []);
  const alSoltar = useCallback(() => {
    if (inicioArrastre.current === null) return;
    inicioArrastre.current = null;
    if (arrastreRef.current > UMBRAL_ARRASTRE_V2) {
      cerrarRef.current('arrastre');
      return;
    }
    arrastreRef.current = 0;
    setArrastre(0);
  }, []);
  const zonaDeArrastre = {
    onPointerDown: alEmpezarArrastre,
    onPointerMove: alArrastrar,
    onPointerUp: alSoltar,
    onPointerCancel: alSoltar,
  };

  const estiloPanel: React.CSSProperties = {
    ...(teclado ? { maxHeight: teclado.visible - 8 } : null),
    ...(arrastre > 0 ? { transform: `translateY(${arrastre}px)`, transition: 'none' } : null),
  };

  return (
    <div
      className="fixed inset-0 flex items-end justify-center font-['Asap',_sans-serif] md:items-center"
      style={{ zIndex: capa, ...(teclado ? { paddingBottom: teclado.alto } : null) }}
      data-modal-v2
    >
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${saliendo ? 'd2-fundido-sale' : 'd2-fundido'}`}
        aria-hidden="true"
        onClick={() => {
          if (!saliendo) onCerrar('fondo');
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={subtitulo ? idSubtitulo : undefined}
        tabIndex={-1}
        style={estiloPanel}
        {...datos}
        className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-[var(--d2-tarjeta)] shadow-2xl outline-none transition-transform duration-200 ease-out md:mx-4 md:max-h-[90vh] md:rounded-2xl ${ANCHOS[ancho]} ${
          saliendo ? 'd2-modal-sale' : 'd2-modal-entra'
        }`}
      >
        {/* Manija (solo celular): arrastrarla hacia abajo cierra */}
        <div
          className="flex shrink-0 cursor-grab touch-none select-none justify-center py-3 active:cursor-grabbing md:hidden"
          aria-hidden="true"
          data-manija-v2
          {...zonaDeArrastre}
        >
          <span className="block h-1.5 w-10 rounded-full bg-[var(--d2-boton-apagado)]" />
        </div>

        {/* Franja del color de la landing: tarjeta en celular, banda en escritorio */}
        <div
          className="mx-4 mb-3 flex shrink-0 touch-none select-none items-center gap-3 rounded-xl bg-[var(--d2-cabecera-inicio)] px-4 py-3 text-[var(--d2-cabecera-texto)] md:mx-0 md:mb-0 md:touch-auto md:select-auto md:rounded-none md:px-5 md:py-4"
          data-franja-v2
          {...zonaDeArrastre}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--d2-cabecera-texto)_20%,transparent)] md:h-10 md:w-10 md:rounded-xl"
            aria-hidden="true"
          >
            <Icono className="h-4 w-4 md:h-5 md:w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={idTitulo} className="text-base font-bold leading-snug">
              {titulo}
            </h2>
            {subtitulo && (
              <p id={idSubtitulo} className="text-xs text-[color-mix(in_srgb,var(--d2-cabecera-texto)_70%,transparent)]">
                {subtitulo}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (!saliendo) onCerrar('x');
            }}
            aria-label={etiquetaCerrar}
            className={`${ZONA_TACTIL_44} flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--d2-cabecera-texto)_20%,transparent)] transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--d2-cabecera-texto)_30%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--d2-cabecera-texto)]`}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className={claseCuerpo ?? 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 md:p-5 md:pt-6'}>
          {children}
        </div>

        {pie && (
          <div
            className={
              clasePie ??
              'flex shrink-0 gap-3 border-t border-[var(--d2-borde)] bg-[var(--d2-tarjeta)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:justify-end md:px-5 md:pb-4'
            }
          >
            {pie}
          </div>
        )}
      </div>
    </div>
  );
}

export default ModalV2;
