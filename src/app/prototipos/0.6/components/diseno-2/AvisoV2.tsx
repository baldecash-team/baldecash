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
 */

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import type { ToastType } from '@/app/prototipos/_shared';
import { useMenosMovimiento } from './movimiento';

export interface AvisoV2Props {
  message: string | null;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  /** ms; 0 no lo cierra solo. */
  duration?: number;
}

function tonoDelAviso(type: ToastType) {
  if (type === 'warning' || type === 'error') {
    return { caja: 'border-[#F2B79A] bg-[#FFF1EB]', icono: 'text-[#C2410C]', Icono: AlertTriangle };
  }
  if (type === 'success') {
    return { caja: 'border-[#BFE6DA] bg-[#E8F7F2]', icono: 'text-[#0B6B5C]', Icono: CheckCircle2 };
  }
  return { caja: 'border-[#D5D9E6] bg-white', icono: 'text-[var(--color-primary-text)]', Icono: Info };
}

export function AvisoV2({ message, type = 'warning', isVisible, onClose, duration = 4000 }: AvisoV2Props) {
  const menosMovimiento = useMenosMovimiento();

  useEffect(() => {
    if (!isVisible || duration <= 0) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [isVisible, duration, onClose]);

  const tono = tonoDelAviso(type);
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
      data-aviso-v2
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
            className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border py-1.5 pl-4 pr-1.5 shadow-lg font-['Asap',_sans-serif] ${tono.caja}`}
          >
            <tono.Icono className={`h-5 w-5 flex-shrink-0 ${tono.icono}`} aria-hidden />
            <p className="flex-1 py-2 text-sm font-medium text-[#1E2230]">{texto}</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar aviso"
              className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-[#3A4052] cursor-pointer hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
