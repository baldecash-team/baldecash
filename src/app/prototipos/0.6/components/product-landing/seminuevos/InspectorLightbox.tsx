'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { GRADOS, inspectorAssetUrl, type Grado } from './data/seminuevosData';

export interface InspectorLightboxProps {
  abierto: boolean;
  pieza: string;
  grado: Grado;
  onGrado: (g: Grado) => void;
  onClose: () => void;
}

/**
 * Visor a pantalla completa de una pieza del inspector, con las tres calidades
 * a mano (BAL-3317).
 *
 * Complementa a la lupa de ZoomSlot: la lupa es para husmear sin salir de la
 * página, esto es para mirar en serio. Se navega entre los GRADOS de la misma
 * pieza --que es la comparación que importa, cómo se degrada esa pieza-- y no
 * entre las 9 imágenes, que mezclaría los dos ejes.
 *
 * No hay modal reusable en el 0.6 (se verificó: los ~118 *Modal* del árbol son
 * de un solo uso y reimplementan su propio backdrop). Se sigue el patrón de
 * AccessoryDetailModal: createPortal + AnimatePresence + backdrop propio.
 */
export function InspectorLightbox({
  abierto, pieza, grado, onGrado, onClose,
}: InspectorLightboxProps) {
  const panel = useRef<HTMLDivElement>(null);
  // Quién tenía el foco antes de abrir, para devolvérselo al cerrar.
  const foco = useRef<HTMLElement | null>(null);
  // Dónde empezó el swipe, para medirlo al soltar.
  const gesto = useRef<{ x: number; y: number } | null>(null);

  const mover = useCallback(
    (paso: number) => {
      const i = GRADOS.indexOf(grado);
      onGrado(GRADOS[(i + paso + GRADOS.length) % GRADOS.length]);
    },
    [grado, onGrado]
  );

  // Teclado: Escape cierra, flechas cambian de grado, Tab no se escapa del
  // panel. Va en un solo listener porque los tres casos comparten el evento.
  useEffect(() => {
    if (!abierto) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key === 'ArrowRight') return mover(1);
      if (e.key === 'ArrowLeft') return mover(-1);
      if (e.key !== 'Tab') return;

      // Focus trap: sin esto el tabulador sigue recorriendo la página de atrás,
      // que para un lector de pantalla es como si el modal no existiera.
      const focos = panel.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focos?.length) return;
      const primero = focos[0];
      const ultimo = focos[focos.length - 1];
      if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      } else if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [abierto, mover, onClose]);

  // Bloqueo del scroll de fondo y devolución del foco.
  useEffect(() => {
    if (!abierto) return;

    foco.current = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // El foco entra al panel para que el lector de pantalla anuncie el diálogo.
    panel.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
      foco.current?.focus();
    };
  }, [abierto]);

  // createPortal necesita el DOM; en el render del servidor no hay document.
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <motion.div
          key="inspector-lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          // Padding superior mayor en móvil: deja sitio al botón de cerrar sin
          // que se monte sobre la muesca del teléfono.
          className="fixed inset-0 z-[10000] flex items-center justify-center px-4 pb-4 pt-16 sm:p-6"
          onClick={onClose}
        >
          {/* El velo va en su PROPIA capa, negro opaco + opacity, en vez de un
              fondo con alfa sobre este contenedor. Comprobado en el navegador:
              con `bg-black/85` --y tambien con `rgba(0,0,0,.85)` inline-- el
              alfa no componia y la landing se leia entera detras del visor;
              con un color OPACO tapaba bien. Separar el velo del contenedor
              que posiciona evita el problema y deja la animacion a
              framer-motion, que anima `opacity` y no el color. */}
          <div
            aria-hidden="true"
            data-testid="lightbox-velo"
            className="absolute inset-0 bg-black opacity-[.88]"
          />
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={`${pieza} de un equipo Grado ${grado}`}
            tabIndex={-1}
            data-testid="inspector-lightbox"
            // El clic dentro NO debe cerrar: solo el del fondo.
            onClick={(e) => e.stopPropagation()}
            // Swipe horizontal para cambiar de grado, que es lo que uno intenta
            // en un visor táctil. Solo cuenta si el gesto es claramente
            // horizontal: si no, un scroll vertical con algo de diagonal
            // cambiaría de grado sin querer.
            onTouchStart={(e) => {
              gesto.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }}
            onTouchEnd={(e) => {
              const ini = gesto.current;
              if (!ini) return;
              gesto.current = null;
              const dx = e.changedTouches[0].clientX - ini.x;
              const dy = e.changedTouches[0].clientY - ini.y;
              if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy)) return;
              mover(dx < 0 ? 1 : -1);
            }}
            className="relative z-[1] flex w-full max-w-[900px] flex-col items-center gap-3 outline-none sm:gap-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- assets de S3 con nombres dinámicos, mismo criterio que MediaSlot */}
            <img
              src={inspectorAssetUrl(pieza, grado)}
              alt={`${pieza} de un equipo Grado ${grado}`}
              // 55vh en móvil: con 70vh los controles de abajo quedaban fuera
              // de pantalla en teléfonos con poco alto.
              className="max-h-[55vh] w-auto max-w-full rounded-[14px] object-contain sm:max-h-[70vh]"
            />

            <p className="text-[15px] font-semibold text-white">
              {pieza} · Grado {grado}
            </p>

            {/* El swipe no se ve: hay que decirlo. Solo en táctil, que es donde
                existe el gesto; en desktop están las flechas del teclado. */}
            <p className="text-[12px] text-white/60 sm:hidden">
              Desliza para comparar los grados
            </p>

            {/* Las tres calidades, para comparar sin cerrar el visor. */}
            <div className="flex gap-2">
              {GRADOS.map((g) => {
                const on = g === grado;
                return (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onGrado(g)}
                    className={`min-h-11 cursor-pointer rounded-[22px] px-4 text-[13.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      on ? 'bg-white text-[var(--navy)]' : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                  >
                    Grado {g}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              data-testid="lightbox-cerrar"
              // En móvil sale FUERA del panel, arriba a la derecha de la
              // pantalla, para no comerse ancho de la foto; desde sm vuelve a
              // la esquina del panel. 44px de lado en ambos casos.
              className="fixed right-4 top-4 z-[2] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:absolute sm:-top-2 sm:right-0"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
