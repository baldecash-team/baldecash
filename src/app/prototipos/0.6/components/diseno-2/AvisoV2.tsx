'use client';

/**
 * Aviso flotante de Diseño 2 (BAL-4969, M-2): "Hay campos incompletos en…" y
 * los errores del envío. Es la versión del kit del `Toast` compartido, que
 * Diseño 1 sigue usando sin cambios.
 *
 * - `role="status"` + `aria-live="polite"`: la región está siempre montada, así
 *   el lector de pantalla anuncia el texto apenas aparece.
 * - Botón de cerrar con `aria-label`, de 44×44 y con foco visible.
 * - La animación se apaga con `prefers-reduced-motion`.
 *
 * Diseño 1 (BAL-5008) usa este mismo aviso con `diseno={1}`: misma lógica y
 * accesibilidad, con los colores del `Toast` de siempre. Antes el resumen de
 * Diseño 1 no montaba ningún aviso y, si faltaba un campo de otro paso,
 * regresaba a ese paso sin decir por qué.
 */

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { ToastType } from '@/app/prototipos/_shared';
import { useMenosMovimiento } from './movimiento';

export interface AvisoV2Props {
  message: string | null;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  /**
   * ms; 0 no lo cierra solo. Un error nunca se cierra solo (verificación
   * final, BAL-4969): como los demás errores de Diseño 2, se queda hasta que
   * la persona lo cierra o lo corrige (vuelve a enviar).
   */
  duration?: number;
  /** 1 = colores del `Toast` de Diseño 1; 2 (por defecto) = kit de Diseño 2. */
  diseno?: 1 | 2;
}

interface TonoDelAviso {
  caja: string;
  icono: string;
  texto: string;
  cerrar: string;
  Icono: typeof AlertTriangle;
}

/**
 * Colores del kit de Diseño 2 con los tokens `--d2-*` (BAL-5076): en claro
 * valen lo mismo que los hex de antes; en la landing oscura toman su par.
 */
function tonoDelAviso(type: ToastType): TonoDelAviso {
  const texto = 'text-[var(--d2-texto)]';
  const cerrar = 'text-[var(--d2-texto-2)] hover:bg-black/5';
  if (type === 'warning' || type === 'error') {
    return { caja: 'border-[var(--d2-error-borde)] bg-[var(--d2-error-suave)]', icono: 'text-[var(--d2-error)]', texto, cerrar, Icono: AlertTriangle };
  }
  if (type === 'success') {
    return { caja: 'border-[var(--d2-ok-borde)] bg-[var(--d2-ok-suave-3)]', icono: 'text-[var(--d2-ok-texto)]', texto, cerrar, Icono: CheckCircle2 };
  }
  return { caja: 'border-[var(--d2-borde-control)] bg-[var(--d2-tarjeta)]', icono: 'text-[var(--color-primary-text)]', texto, cerrar, Icono: Info };
}

/**
 * El morado fijo del `Toast` de Diseño 1: Diseño 1 no toma el color de la
 * landing, así que aquí sí va el hex (excepción declarada en
 * `colorDeLaLanding.test.ts`, solo para las constantes `D1_`).
 */
const D1_ICONO_INFO = 'text-[#4654CD]';
const D1_ANILLO = 'focus-visible:ring-[#4654CD]';

/** Los colores del `Toast` compartido de Diseño 1 (BAL-5008). */
function tonoDelAvisoD1(type: ToastType): TonoDelAviso {
  if (type === 'warning') {
    return {
      caja: 'border-amber-300 bg-amber-50 shadow-amber-100/50',
      icono: 'text-[#f59e0b]',
      texto: 'text-amber-900',
      cerrar: 'text-amber-900 hover:bg-black/5',
      Icono: AlertTriangle,
    };
  }
  if (type === 'error') {
    return { caja: 'border-neutral-800 bg-neutral-800', icono: 'text-[#ef4444]', texto: 'text-white', cerrar: 'text-white hover:bg-white/10', Icono: XCircle };
  }
  if (type === 'success') {
    return { caja: 'border-neutral-800 bg-neutral-800', icono: 'text-[#22c55e]', texto: 'text-white', cerrar: 'text-white hover:bg-white/10', Icono: CheckCircle2 };
  }
  return { caja: 'border-neutral-200 bg-white', icono: D1_ICONO_INFO, texto: 'text-neutral-800', cerrar: 'text-neutral-600 hover:bg-black/5', Icono: Info };
}

export function AvisoV2({ message, type = 'warning', isVisible, onClose, duration = 4000, diseno = 2 }: AvisoV2Props) {
  const menosMovimiento = useMenosMovimiento();

  const seCierraSolo = duration > 0 && type !== 'error';
  useEffect(() => {
    if (!isVisible || !seCierraSolo) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [isVisible, seCierraSolo, duration, onClose]);

  const tono = diseno === 1 ? tonoDelAvisoD1(type) : tonoDelAviso(type);
  // Defensa (BAL-4969): si algún día llega algo que no es texto (un `detail`
  // de 422 como lista u objeto), se muestra un texto genérico en vez de
  // tumbar la pantalla: React no pinta objetos.
  const texto: string | null =
    typeof message === 'string' ? message : message == null ? null : 'No pudimos completar la acción. Por favor intenta nuevamente.';
  const visible = isVisible && !!texto;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-aviso-v2={diseno === 2 ? '' : undefined}
      data-aviso-d1={diseno === 1 ? '' : undefined}
      className="pointer-events-none fixed inset-x-0 top-20 z-[200] flex justify-center px-4"
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            key={texto ?? ''}
            initial={menosMovimiento ? { opacity: 0 } : { opacity: 0, y: -16 }}
            animate={menosMovimiento ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={menosMovimiento ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: menosMovimiento ? 0 : 0.2 }}
            className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border py-1.5 pl-4 pr-1.5 shadow-lg ${diseno === 2 ? "font-['Asap',_sans-serif]" : ''} ${tono.caja}`}
          >
            <tono.Icono className={`h-5 w-5 flex-shrink-0 ${tono.icono}`} aria-hidden />
            <p className={`flex-1 py-2 text-sm font-medium ${tono.texto}`}>{texto}</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar aviso"
              className={`inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${diseno === 2 ? 'focus-visible:ring-[var(--color-primary)]' : D1_ANILLO} ${tono.cerrar}`}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
