'use client';

/**
 * Transición entre pasos de Diseño 2: "¡Un paso más!" (BAL-4959).
 *
 * El camino de los pasos (nodos con su nombre y la barra) se llena del que se
 * completó al siguiente. Dura ~2,7 s y después avisa `onComplete`, que es donde sigue la
 * navegación de siempre (`usePasoDelWizard`). Un clic, Enter, Espacio o
 * Escape la saltan y navegan al instante.
 *
 * `onComplete` se avisa UNA sola vez por montaje: es el mismo cuidado de
 * `StepSuccessMessage`, porque ese callback puede enviar la solicitud y un
 * aviso de más sería un envío de más.
 *
 * Con `prefers-reduced-motion` no hay movimiento: el camino ya aparece lleno
 * hasta el paso siguiente y la pantalla dura menos.
 *
 * Movimiento (BAL-4969): fundido de entrada (`bcFadeIn` 0,2 s), check del paso
 * hecho, la barra que se llena, el anillo del paso que sigue y textos que
 * entran escalonados (`bcPop` 0,4 s). Todo con `transform`/`opacity`; las
 * keyframes viven en `globals.css` (`d2*`).
 *
 * BAL-5203 (Brenda, 27-oct): sin Baldecito ni sus chispas; solo el progreso.
 */

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useWizardConfig, pasosConPrimerResumen } from '@/app/prototipos/0.6/[landing]/solicitar/context/WizardConfigContext';
import { getStepSlug } from '@/app/prototipos/0.6/services/wizardApi';
import { etiquetaCortaDelPaso, etiquetaDelPaso } from './ProgresoV2';
import { useMenosMovimiento } from './movimiento';
import { Check, ArrowRight } from 'lucide-react';
import { getMessage } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/celebration/StepSuccessMessage';

export const DURACION_TRANSICION_MS = 2700;
export const DURACION_TRANSICION_REDUCIDA_MS = 1200;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface TransicionPasoProps {
  /** Nombres de todos los pasos (N = largo de la lista). */
  pasos: string[];
  /**
   * Etiquetas cortas bajo cada nodo («Personales», «Académicos»…), como en el
   * prototipo: en 88 px no entra «Datos Académicos». Sin ellas, los nombres.
   */
  etiquetas?: string[];
  /** Número (1..N) del paso que se acaba de completar. */
  pasoCompletado: number;
  onComplete: () => void;
}

export function TransicionPaso({ pasos, etiquetas, pasoCompletado, onComplete }: TransicionPasoProps) {
  const reducido = useMenosMovimiento();
  const total = pasos.length;
  const desde = Math.min(Math.max(pasoCompletado, 1), Math.max(total, 1)) - 1; // índice
  const hasta = Math.min(desde + 1, Math.max(total - 1, 0));
  const siguiente = pasos[hasta];

  const avisar = useRef(onComplete);
  useLayoutEffect(() => {
    avisar.current = onComplete;
  }, [onComplete]);
  const avisado = useRef(false);
  const terminar = useCallback(() => {
    if (avisado.current) return;
    avisado.current = true;
    avisar.current();
  }, []);

  const duracion = reducido ? DURACION_TRANSICION_REDUCIDA_MS : DURACION_TRANSICION_MS;
  useEffect(() => {
    const t = window.setTimeout(terminar, duracion);
    return () => window.clearTimeout(t);
  }, [duracion, terminar]);

  const botonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Foco atrapado mientras la transición está visible (role=dialog
  // aria-modal), y de vuelta a donde estaba al terminar — mismo patrón que
  // `LoQuieroModal` (BAL-4959, hallazgo de la revisión de accesibilidad).
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    botonRef.current?.focus({ preventScroll: true });

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        terminar();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodo = dialogRef.current;
      if (!nodo) return;
      const nodos = Array.from(nodo.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null,
      );
      if (nodos.length === 0) return;
      const primero = nodos[0];
      const ultimo = nodos[nodos.length - 1];
      const activo = document.activeElement;
      if (e.shiftKey && (activo === primero || activo === nodo)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault();
        primero.focus();
      } else if (!nodo.contains(activo)) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('keydown', alTeclear);
      anterior?.focus?.();
    };
    // Solo al montar: `terminar` ya tiene su propio pestillo de "una vez".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Geometría del puente del prototipo: camino de 308 px, nodos de 32 px y
  // etiquetas de 88 px. Con 4 pasos el salto es de 88 px, como en el
  // prototipo; con otra cantidad se reparte el mismo largo.
  const X0 = 22;
  const LARGO = 264;
  const GAP = total <= 1 ? 0 : LARGO / (total - 1);
  const x = (i: number) => X0 + i * GAP;
  const avanza = hasta !== desde;
  const titulo = tituloDelPuente(pasoCompletado, total);
  const an = (k: string, dur: number, demora: number, curva = 'ease-out') =>
    reducido ? undefined : { animation: `${k} ${dur}s ${curva} ${demora}s both` };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transicion-paso-titulo"
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden px-4 py-6 cursor-pointer font-['Asap',_sans-serif] text-[var(--d2-texto)]"
      onClick={terminar}
      style={{
        background: 'radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--color-primary) 9%, var(--d2-tarjeta)) 0%, var(--d2-tarjeta) 62%)',
        ...an('d2Fundido', 0.2, 0),
      }}
      data-transicion-v2
    >
      <div className="flex w-full max-w-[420px] flex-col items-center text-center">
        {/* Progreso: los pasos con sus nombres y la barra (BAL-5203: sin
            Baldecito; el camino arranca arriba, sin el hueco del salto). */}
        <div data-progreso-puente className="relative h-[60px] w-[308px] max-w-full sm:[zoom:1.2]" aria-hidden>
          <span className="absolute left-[22px] right-[22px] top-[14px] h-1 rounded-full bg-[var(--d2-borde)]" />
          <span
            className="absolute left-[22px] top-[14px] h-1 rounded-full bg-[var(--d2-progreso-ok)]"
            style={{ width: desde * GAP }}
          />
          {avanza && (
            <span
              data-camino-lleno
              className="absolute top-[14px] h-1 origin-left rounded-full bg-[var(--d2-progreso-ok)]"
              style={{ left: x(desde), width: GAP, ...an('d2Llenado', 0.9, 0.35, 'ease-in-out') }}
            />
          )}
          {pasos.map((nombre, i) => {
            const hecho = i <= desde;
            const sigue = i === hasta && avanza;
            return (
              <React.Fragment key={`${nombre}-${i}`}>
                <span
                  className={`absolute top-0 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    hecho
                      ? 'bg-[var(--d2-progreso-ok)] text-white'
                      : sigue
                        ? 'border-[3px] border-[var(--color-primary)] bg-[var(--d2-tarjeta)] text-[var(--color-primary-text)]'
                        : 'border-2 border-[var(--d2-borde-campo)] bg-[var(--d2-tarjeta)] text-[var(--d2-texto-tenue)]'
                  }`}
                  style={{
                    left: x(i) - 16,
                    ...(i === desde ? an('d2CheckIn', 0.45, 0.1) : sigue ? an('d2Anillo', 0.6, 1.2) : undefined),
                  }}
                >
                  {hecho ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  data-etiqueta-puente
                  className={`absolute top-[38px] w-[88px] truncate px-1 text-center text-xs ${
                    hecho ? 'font-semibold text-[var(--d2-ok-texto)]' : sigue ? 'font-bold text-[var(--color-primary-text)]' : 'text-[var(--d2-texto-tenue)]'
                  }`}
                  style={{ left: x(i) - 44 }}
                >
                  {etiquetas?.[i] || nombre}
                </span>
              </React.Fragment>
            );
          })}
        </div>

        <h2
          id="transicion-paso-titulo"
          className="mt-[22px] font-['Baloo_2',_sans-serif] text-[34px] font-bold leading-[1.1] text-[var(--d2-texto)]"
          style={an('d2Pop', 0.4, 0.15)}
        >
          {titulo}
        </h2>
        <p className="mt-1.5 text-base text-[var(--d2-texto-suave)]" style={an('d2Pop', 0.4, 0.3)}>
          Paso {pasoCompletado} de {total} completado
        </p>
        {siguiente && avanza && (
          <p
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[rgba(var(--color-primary-rgb),0.12)] px-3.5 py-[7px] text-sm font-bold text-[var(--color-primary-text)]"
            style={an('d2Pop', 0.4, 1.3)}
          >
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} aria-hidden />
            Sigue: {siguiente}
          </p>
        )}
        <button
          ref={botonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            terminar();
          }}
          className="relative mt-[26px] min-h-[46px] overflow-hidden rounded-xl border-[1.5px] border-[var(--d2-borde-campo)] bg-[var(--d2-tarjeta)] px-7 text-[15px] font-bold text-[var(--color-primary-text)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
        >
          Continuar
          <span
            aria-hidden
            className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-[var(--color-primary)]"
            // El tiempo que queda (`bcFill`): informa, así que corre siempre.
            style={{ animation: `d2Llenado ${duracion}ms linear both` }}
          />
        </button>
      </div>
    </div>
  );
}

/**
 * Título del puente: los de Brenda por número de paso (¡Buen comienzo!,
 * ¡Vas muy bien!, ¡Un paso más!) y, al completar el último, el de siempre.
 */
export function tituloDelPuente(pasoCompletado: number, total: number): string {
  if (pasoCompletado >= total) return getMessage(pasoCompletado, total);
  return ['¡Buen comienzo!', '¡Vas muy bien!', '¡Un paso más!'][pasoCompletado - 1] || '¡Un paso más!';
}

/**
 * La transición tal como la monta `usePasoDelWizard` (prop `Celebracion`):
 * recibe lo mismo que `StepSuccessMessage` y saca de la config los nombres de
 * los pasos. El número del paso sale de su posición en la lista, no de
 * `order`, que puede venir con huecos.
 */
export function TransicionDelWizard({
  stepNumber,
  onComplete,
}: {
  stepName: string;
  stepNumber: number;
  totalSteps: number;
  onComplete: () => void;
}) {
  const { steps } = useWizardConfig();
  const params = useParams();
  const slugActual = (params?.stepSlug as string) || '';
  // Misma cuenta que `pasosDelProgreso` (ShellV2): regulares + SOLO el primer
  // resumen, para que el total coincida con "paso X de N" del progreso.
  const pasos = useMemo(() => {
    return pasosConPrimerResumen(steps).map((s) => ({
      slug: getStepSlug(s),
      nombre: etiquetaDelPaso(s),
      corta: etiquetaCortaDelPaso(s),
    }));
  }, [steps]);
  const posicion = pasos.findIndex((p) => p.slug === slugActual);
  return (
    <TransicionPaso
      pasos={pasos.map((p) => p.nombre)}
      etiquetas={pasos.map((p) => p.corta)}
      pasoCompletado={posicion >= 0 ? posicion + 1 : stepNumber}
      onComplete={onComplete}
    />
  );
}

export default TransicionPaso;
