'use client';

/**
 * Transición entre pasos de Diseño 2: "¡Un paso más!" (BAL-4959).
 *
 * Baldecito avanza por el camino de los pasos, del que se completó al
 * siguiente. Dura ~2,7 s y después avisa `onComplete`, que es donde sigue la
 * navegación de siempre (`usePasoDelWizard`). Un clic, Enter, Espacio o
 * Escape la saltan y navegan al instante.
 *
 * `onComplete` se avisa UNA sola vez por montaje: es el mismo cuidado de
 * `StepSuccessMessage`, porque ese callback puede enviar la solicitud y un
 * aviso de más sería un envío de más.
 *
 * Con `prefers-reduced-motion` no hay movimiento: Baldecito aparece ya en el
 * paso siguiente y la pantalla dura menos.
 */

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useWizardConfig, pasosConPrimerResumen } from '@/app/prototipos/0.6/[landing]/solicitar/context/WizardConfigContext';
import { getStepSlug } from '@/app/prototipos/0.6/services/wizardApi';
import { etiquetaDelPaso } from './ProgresoV2';
import { useMenosMovimiento } from './movimiento';
import { Check, ArrowRight } from 'lucide-react';
import { getMessage } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/celebration/StepSuccessMessage';

export const DURACION_TRANSICION_MS = 2700;
export const DURACION_TRANSICION_REDUCIDA_MS = 1200;

/** Baldecito alegre: lo reutiliza también la cabecera de `ConfirmacionV2` (F8, BAL-4967). */
export const BALDECITO = 'https://baldecash.s3.amazonaws.com/illustrations/baldi/BALDI_ALEGRE.png';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface TransicionPasoProps {
  /** Nombres de todos los pasos (N = largo de la lista). */
  pasos: string[];
  /** Número (1..N) del paso que se acaba de completar. */
  pasoCompletado: number;
  onComplete: () => void;
}

export function TransicionPaso({ pasos, pasoCompletado, onComplete }: TransicionPasoProps) {
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

  // Posición de cada nodo en el camino, en % del ancho.
  const pos = (i: number) => (total <= 1 ? 50 : (i / (total - 1)) * 100);
  const titulo = getMessage(pasoCompletado, total);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="transicion-paso-titulo"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#F7F8FC] px-6 cursor-pointer"
      onClick={terminar}
      data-transicion-v2
    >
      <style>{`
        @keyframes tpAvance { from { left: ${pos(desde)}%; } to { left: ${pos(hasta)}%; } }
        @keyframes tpSalto { 0%,100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -8px); } }
        @keyframes tpLlenar { from { width: ${pos(desde)}%; } to { width: ${pos(hasta)}%; } }
        @keyframes tpTiempo { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes tpAparece { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
      <div className="w-full max-w-md text-center">
        {/* Camino con Baldecito */}
        <div className="relative mx-auto mb-10 h-28 w-full max-w-sm" aria-hidden>
          <div
            className="absolute bottom-[50px] h-24 w-20"
            style={
              reducido
                ? { left: `${pos(hasta)}%`, transform: 'translateX(-50%)' }
                : {
                    left: `${pos(hasta)}%`,
                    transform: 'translateX(-50%)',
                    animation: `tpAvance 1.1s ease-in-out 0.5s both, tpSalto 0.55s ease-in-out 0.5s 2`,
                  }
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BALDECITO} alt="" className="h-full w-full object-contain" />
          </div>
          <div className="absolute bottom-[18px] left-0 right-0 h-1 rounded-full bg-[#E3E6EE]">
            <div
              className="h-full rounded-full bg-[#12A877]"
              style={reducido ? { width: `${pos(hasta)}%` } : { width: `${pos(hasta)}%`, animation: 'tpLlenar 1.1s ease-in-out 0.5s both' }}
            />
          </div>
          {pasos.map((nombre, i) => {
            const hecho = i <= desde;
            const actual = i === hasta && hasta !== desde;
            return (
              <span
                key={`${nombre}-${i}`}
                className={`absolute bottom-[4px] flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  hecho
                    ? 'border-[#12A877] bg-[#12A877] text-white'
                    : actual
                      ? 'border-[var(--color-primary)] bg-white text-[var(--color-primary-text)]'
                      : 'border-[#D5D9E6] bg-white text-[#5B6275]'
                }`}
                style={{ left: `${pos(i)}%` }}
              >
                {hecho ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </span>
            );
          })}
        </div>

        <h2 id="transicion-paso-titulo" className="font-['Baloo_2',_sans-serif] text-3xl font-bold text-[#1E2230]">
          {titulo}
        </h2>
        <p className="mt-1 text-sm text-[#5B6275]">
          Paso {pasoCompletado} de {total} completado
        </p>
        {siguiente && hasta !== desde && (
          <p
            className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-4 py-1.5 text-sm font-semibold text-[var(--color-primary-text)]"
            style={reducido ? undefined : { animation: 'tpAparece 0.3s ease-out 1.2s both' }}
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
            Sigue: {siguiente}
          </p>
        )}
        <div className="mt-6">
          <button
            ref={botonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              terminar();
            }}
            className="relative min-h-[48px] overflow-hidden rounded-xl border border-[#AEB6EE] bg-white px-7 text-base font-bold text-[var(--color-primary-text)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
          >
            Continuar
            <span
              aria-hidden
              className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-[var(--color-primary)]"
              style={{ animation: `tpTiempo ${duracion}ms linear both` }}
            />
          </button>
        </div>
      </div>
    </div>
  );
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
    return pasosConPrimerResumen(steps).map((s) => ({ slug: getStepSlug(s), nombre: etiquetaDelPaso(s) }));
  }, [steps]);
  const posicion = pasos.findIndex((p) => p.slug === slugActual);
  return (
    <TransicionPaso
      pasos={pasos.map((p) => p.nombre)}
      pasoCompletado={posicion >= 0 ? posicion + 1 : stepNumber}
      onComplete={onComplete}
    />
  );
}

export default TransicionPaso;
