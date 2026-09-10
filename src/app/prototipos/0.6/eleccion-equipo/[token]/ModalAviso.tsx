'use client';

import { useEffect, useRef } from 'react';

/**
 * Diálogo para los desenlaces de una reserva que fallan.
 *
 * Antes esto era un banner `role="status"` arriba de la grilla. El problema no
 * era que se viera poco: era que la lista se refresca DEBAJO en el mismo
 * momento, así que la persona tocaba una unidad, la grilla cambiaba sola y el
 * motivo quedaba en un texto que había que ir a buscar. Con la galería recién
 * cerrada y las cards moviéndose, es fácil creer que la reserva salió.
 *
 * Un diálogo obliga a leer el desenlace antes de seguir, y deja explícito qué
 * hacer ahora.
 *
 * ## Accesibilidad
 *
 * Declarar `aria-modal` sin manejar el foco es PEOR que no declararlo: le dice
 * a la tecnología asistiva que lo de atrás está inerte mientras un usuario de
 * teclado sigue tabulando por las cards. Se cierra el círculo igual que en
 * `GaleriaUnidad`: foco adentro al abrir, atrapado mientras está abierto,
 * devuelto al elemento previo al cerrar, y el body sin scroll de fondo.
 */

const FOCUSABLES = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface ModalAvisoProps {
  titulo: string;
  mensaje: string;
  /** Texto del botón principal. Dice qué pasa al tocarlo, no "Aceptar". */
  textoBoton: string;
  onCerrar: () => void;
  /** Acción secundaria opcional (p. ej. "Reintentar"). */
  secundario?: { texto: string; onClick: () => void };
  /** Enlace secundario, para salir de la página (p. ej. al catálogo). */
  enlace?: { texto: string; href: string };
  /** `error` pinta el ícono en rojo; `info` en ámbar (desenlace esperado). */
  tono?: 'info' | 'error';
}

export default function ModalAviso({
  titulo,
  mensaje,
  textoBoton,
  onCerrar,
  secundario,
  enlace,
  tono = 'info',
}: ModalAvisoProps) {
  const dialogoRef = useRef<HTMLDivElement | null>(null);
  // El handler de Escape se lee por ref para que el efecto corra UNA vez por
  // apertura: con `onCerrar` en las dependencias, un padre que recrea la
  // función en cada render reinstalaría el listener y se llevaría el foco.
  const cerrarRef = useRef(onCerrar);
  cerrarRef.current = onCerrar;

  useEffect(() => {
    const dialogo = dialogoRef.current;
    const previo = document.activeElement as HTMLElement | null;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogo?.focus();

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return cerrarRef.current();
      if (e.key !== 'Tab' || !dialogo) return;

      const focusables = Array.from(dialogo.querySelectorAll<HTMLElement>(FOCUSABLES));
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const primero = focusables[0];
      const ultimo = focusables[focusables.length - 1];
      const activo = document.activeElement;

      // El propio diálogo cuenta como "antes del primero": es donde arranca el
      // foco al abrir, así que un Shift+Tab desde ahí tiene que ir al último.
      if (e.shiftKey && (activo === primero || activo === dialogo)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflowPrevio;
      // Puede ser un nodo ya desmontado: el refresco tras un 409 rehace la
      // lista. Enfocar un nodo suelto es un no-op, no un error.
      previo?.focus?.();
    };
  }, []);

  const rojo = tono === 'error';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5"
      // El fondo cierra, como en cualquier diálogo no destructivo. No se usa
      // `onClick` en el contenedor sin este guard: un clic que empieza dentro
      // y termina afuera (arrastrar para seleccionar texto) cerraría el modal.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-aviso-titulo"
        aria-describedby="modal-aviso-mensaje"
        tabIndex={-1}
        className="w-full max-w-[420px] rounded-3xl bg-white p-6 text-center shadow-xl outline-none"
      >
        <div
          aria-hidden="true"
          className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-[22px] ${
            rojo ? 'bg-[#fdecea] text-[#c62828]' : 'bg-[#fff4e5] text-[#b5651d]'
          }`}
        >
          {rojo ? '!' : 'i'}
        </div>

        <h2 id="modal-aviso-titulo" className="mb-2 text-[17px] font-semibold text-[#1f2430]">
          {titulo}
        </h2>
        <p id="modal-aviso-mensaje" className="mb-6 text-[14px] leading-relaxed text-[#5b6172]">
          {mensaje}
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onCerrar}
            className="w-full rounded-full bg-[#4654CD] px-5 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            {textoBoton}
          </button>
          {secundario && (
            <button
              type="button"
              onClick={secundario.onClick}
              className="w-full rounded-full px-5 py-2.5 text-[14px] font-medium text-[#4654CD] hover:underline"
            >
              {secundario.texto}
            </button>
          )}
          {enlace && (
            <a
              href={enlace.href}
              className="w-full rounded-full px-5 py-2.5 text-[14px] font-medium text-[#4654CD] hover:underline"
            >
              {enlace.texto}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
