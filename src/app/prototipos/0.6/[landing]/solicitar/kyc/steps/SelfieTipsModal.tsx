'use client';

/**
 * SelfieTipsModal — condiciones de la selfie, ANTES de abrir la cámara.
 *
 * Es bloqueante a propósito: sin cierre por backdrop, sin "X" y con una sola
 * acción. Las condiciones que hacen fallar la comparación facial (gorra,
 * lentes, poca luz, rostro tapado) solo se podían leer DESPUÉS del rechazo, en
 * la tarjeta de error — o sea, cuando el postulante ya se sacó la foto y el
 * costo de repetirla es suyo. Ponerlas delante es lo que evita el reintento,
 * no explicarlas mejor después.
 *
 * Reaparece en cada reintento (lo gobierna `DniSelfieStep`): quien repite la
 * foto es justo quien no cumplió alguna condición, así que ese es el momento
 * en que el recordatorio sirve. Con `attempt` en el tracking se puede ver si
 * los reintentos bajan cuando el recordatorio vuelve a mostrarse.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Glasses, HardHat, ScanFace, Sun } from 'lucide-react';

/**
 * Las cuatro condiciones. Cada una dice QUÉ hacer, no solo qué está mal: un
 * "sin gorra" suelto no le dice a nadie que la capucha también cuenta.
 */
const CONDICIONES = [
  {
    icon: HardHat,
    title: 'Sin gorra ni capucha',
    detail: 'Nada que tape tu frente ni proyecte sombra sobre tu cara.',
  },
  {
    icon: Glasses,
    title: 'Sin lentes',
    detail: 'Ni de sol ni de medida: el reflejo tapa los ojos.',
  },
  {
    icon: Sun,
    title: 'Con buena luz',
    detail: 'De frente a la luz, nunca a contraluz de una ventana.',
  },
  {
    icon: ScanFace,
    title: 'Rostro descubierto',
    detail: 'Sin mascarilla, bufanda ni cabello sobre la cara.',
  },
] as const;

export interface SelfieTipsModalProps {
  open: boolean;
  /** Única salida del modal: acepta y recién ahí se pide la cámara. */
  onAccept: () => void;
}

export function SelfieTipsModal({ open, onAccept }: SelfieTipsModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop sin `onClick`: tocar fuera no cierra. Si cerrara, la
              condición más común —tocar cualquier lado para seguir— saltearía
              justo la pantalla que existe para ser leída. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[10002] bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-[10002] flex items-center justify-center p-4"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="selfie-tips-title"
              className="relative w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-sm px-6 py-7"
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-[#ECECFB] flex items-center justify-center">
                  <ScanFace className="w-7 h-7 text-[#4654CD]" />
                </div>
                <h3 id="selfie-tips-title" className="text-lg font-bold text-[#1f2937]">
                  Antes de tu selfie
                </h3>
                <p className="text-sm text-[#6b7280]">
                  Vamos a comparar tu rostro con el de tu DNI. Para que salga a la
                  primera, revisa estas condiciones.
                </p>
              </div>

              <ul className="mt-5 space-y-3">
                {CONDICIONES.map(({ icon: Icon, title, detail }) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F7F7FB] border border-[#ECECFB]">
                      <Icon aria-hidden className="h-4 w-4 text-[#4654CD]" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#1f2937]">{title}</span>
                      <span className="block text-xs text-[#6b7280] leading-snug">{detail}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={onAccept}
                autoFocus
                className="mt-6 w-full bg-[#4654CD] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SelfieTipsModal;
