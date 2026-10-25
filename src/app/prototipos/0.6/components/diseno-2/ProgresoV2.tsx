'use client';

/**
 * Progreso de la solicitud en Diseño 2 (BAL-4959): "Tus datos · paso X de N" y
 * una barra por paso con su nombre.
 *
 * Es un componente de presentación puro: los pasos, cuáles están hechos y a
 * dónde navegar los decide quien lo monta (`ShellV2`). N es el largo real de
 * la lista —los pasos del formulario de la BD—, nunca un 4 fijo.
 *
 * La regla de "se puede volver" es la de `WizardProgress` (Diseño 1): un paso
 * es clicable si está completo o si es anterior al actual, y solo cuando hay
 * `onIrAPaso` (el contrato firmado lo quita).
 */

import React from 'react';
import { Check } from 'lucide-react';
import { isStepClickable } from '@/app/prototipos/0.6/[landing]/solicitar/components/solicitar/wizard/WizardProgress';
import type { WizardStep } from '@/app/prototipos/0.6/services/wizardApi';

/**
 * Texto del paso en la barra: la misma regla de `WizardProgress` (Diseño 1,
 * `main` ffaf8652) — `progress_label` editable en admin2 y, si falta o viene
 * vacío, el título del paso. El paso de resumen sin `progress_label` se llama
 * "Resumen", igual que en Diseño 1 (BAL-4969, M-3).
 */
export function etiquetaDelPaso(
  step: Pick<WizardStep, 'title' | 'progress_label'> & { is_summary_step?: boolean },
): string {
  return step.progress_label?.trim() || (step.is_summary_step ? 'Resumen' : step.title);
}

/**
 * Etiqueta corta del puente entre pasos (verificación final, BAL-4969): el
 * `progress_label` del paso si existe; si no, el nombre corto del prototipo de
 * Brenda — el título sin el «Datos » del inicio («Datos Académicos» →
 * «Académicos»). El resumen sin `progress_label` es «Resumen».
 */
export function etiquetaCortaDelPaso(
  step: Pick<WizardStep, 'title' | 'progress_label'> & { is_summary_step?: boolean },
): string {
  const propia = step.progress_label?.trim();
  if (propia) return propia;
  if (step.is_summary_step) return 'Resumen';
  const sinDatos = (step.title || '').trim().replace(/^datos\s+/i, '');
  return sinDatos ? sinDatos.charAt(0).toUpperCase() + sinDatos.slice(1) : step.title;
}

export interface PasoDelProgreso {
  /** Slug de la URL del paso: es lo que recibe `onIrAPaso`. */
  slug: string;
  /** Etiqueta visible: `etiquetaDelPaso` (progress_label o el título). */
  nombre: string;
}

export interface ProgresoV2Props {
  pasos: PasoDelProgreso[];
  /** Índice (0..N-1) del paso que se está mostrando. */
  indiceActual: number;
  /** Slugs de los pasos con todos sus obligatorios llenos. */
  completados: ReadonlySet<string>;
  /** Sin esto ningún paso es clicable. */
  onIrAPaso?: (slug: string) => void;
}

/**
 * El paso actual nunca es clicable (acá no hay nada que lo distinga de un
 * botón normal si lo fuera): el resto es exactamente `WizardProgress.isStepClickable`,
 * reusada en vez de repetida.
 */
export function pasoEsClicable(
  indice: number,
  slug: string,
  indiceActual: number,
  completados: ReadonlySet<string>,
  hayNavegacion: boolean,
): boolean {
  if (indice === indiceActual) return false;
  return isStepClickable(slug, indice, indiceActual, Array.from(completados), hayNavegacion ? () => {} : undefined);
}

export function ProgresoV2({ pasos, indiceActual, completados, onIrAPaso }: ProgresoV2Props) {
  const total = pasos.length;
  if (total === 0) return null;
  const numeroActual = Math.min(Math.max(indiceActual, 0), total - 1) + 1;

  return (
    <nav aria-label="Progreso de tu solicitud" className="mb-6">
      <p className="text-sm text-[var(--d2-texto-suave)] mb-2.5">
        <strong className="font-bold text-[var(--d2-texto)]">Tus datos</strong> · paso {numeroActual} de {total}
      </p>
      <ol className="grid gap-3" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {pasos.map((paso, i) => {
          const esActual = i === indiceActual;
          const hecho = !esActual && completados.has(paso.slug);
          const clicable = pasoEsClicable(i, paso.slug, indiceActual, completados, !!onIrAPaso);
          const llena = esActual || hecho || i < indiceActual;
          // Al llegar al paso (prototipo de Brenda): la barra del actual se
          // llena (`bcGrow` 0,7 s), el check del recién hecho aparece
          // (`bcCheckIn` 0,45 s) y después el número del actual (0,4 s a los
          // 0,85 s). Solo transform; con menos movimiento, `globals.css` las apaga.
          const animNumero = esActual ? ' d2-check-actual' : hecho && i === indiceActual - 1 ? ' d2-check-hecho' : '';

          const contenido = (
            <>
              <span className="relative block h-1 overflow-hidden rounded-full bg-[var(--d2-borde)]" aria-hidden>
                {llena && (
                  <span
                    data-barra-llena
                    className={`absolute inset-0 rounded-full bg-[var(--color-primary)]${esActual ? ' d2-crece' : ''}`}
                  />
                )}
              </span>
              <span className="mt-2.5 flex items-center gap-2 min-w-0">
                <span
                  aria-hidden
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold${animNumero} ${
                    hecho || esActual
                      ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                      : 'border border-[var(--d2-borde-control)] bg-[var(--d2-tarjeta)] text-[var(--d2-texto-suave)]'
                  }`}
                >
                  {hecho ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={`truncate text-sm ${
                    esActual
                      ? 'font-bold text-[var(--color-primary-text)]'
                      : hecho
                        ? 'text-[var(--d2-texto)] underline underline-offset-2'
                        : 'text-[var(--d2-texto-suave)]'
                  }`}
                >
                  {paso.nombre}
                </span>
              </span>
            </>
          );

          return (
            <li key={paso.slug} className="min-w-0" aria-current={esActual ? 'step' : undefined}>
              {clicable ? (
                <button
                  type="button"
                  onClick={() => onIrAPaso?.(paso.slug)}
                  className="block w-full min-h-[44px] text-left cursor-pointer rounded-md hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                  aria-label={`Volver a ${paso.nombre} (paso ${i + 1} de ${total})`}
                >
                  {contenido}
                </button>
              ) : (
                <div className="min-h-[44px]">{contenido}</div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * La versión de celular: "Paso X de N" va en la cabecera del producto y debajo
 * una barra fina. Va aparte porque vive dentro de `PanelSolicitudV2`.
 */
export function ProgresoMovilV2({ indiceActual, total }: { indiceActual: number; total: number }) {
  if (total === 0) return null;
  const numero = Math.min(Math.max(indiceActual, 0), total - 1) + 1;
  return (
    <div
      className="h-[3px] bg-[var(--d2-borde)]"
      role="progressbar"
      aria-label={`Paso ${numero} de ${total}`}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={numero}
    >
      {/* Se llena desde donde quedó el paso anterior (`bcProgIn` del
          prototipo): escala, no ancho, para no recalcular el layout. */}
      <div
        className="h-full bg-[var(--color-primary)] d2-crece-movil"
        style={{ width: `${(numero / total) * 100}%`, ['--d2-desde' as string]: (numero - 1) / numero }}
      />
    </div>
  );
}

export default ProgresoV2;
