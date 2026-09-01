'use client';

/**
 * Etiqueta de un campo con una ayuda que se abre a pedido.
 *
 * Vivía dentro de `CampoMonto`. Salió acá cuando el segundo campo de la
 * calculadora necesitó la misma ayuda: dos copias del mismo panel son dos
 * formas de cerrarlo, y la que se olvida deja el panel abierto tapando el campo
 * en un teléfono, que es justo el caso que la lógica de cierre resuelve.
 *
 * El contenido lo pone quien lo usa. La forma del cuerpo cambia con lo que se
 * explica —una lista de pasos, un párrafo con un enlace— y meter las dos formas
 * acá adentro convierte al componente en un selector de plantillas.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Info, X } from 'lucide-react';

interface Props {
  /** Identificador del campo que esta etiqueta rotula. */
  idCampo: string;
  etiqueta: string;
  /** Título del panel. Sin él no se dibuja el botón: no todo campo necesita ayuda. */
  tituloAyuda?: string;
  /** Cuerpo del panel. Solo se lee cuando hay título. */
  children?: React.ReactNode;
}

export function AyudaDesplegable({ idCampo, etiqueta, tituloAyuda, children }: Props) {
  /**
   * La ayuda se abre a pedido, nunca sola.
   *
   * Explica cómo llegar a una pantalla ajena —el sistema de la institución— y
   * no todo el mundo la necesita: abrirla de entrada le tapa el campo a quien
   * ya tiene el dato a mano.
   */
  const [abierta, setAbierta] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape y al tocar fuera. Sin esto, en un teléfono el panel queda
  // abierto tapando el campo y la única salida es volver a tocar el botón.
  useEffect(() => {
    if (!abierta) return;

    const alTocarFuera = (evento: MouseEvent) => {
      if (!contenedorRef.current?.contains(evento.target as Node)) setAbierta(false);
    };
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbierta(false);
    };

    document.addEventListener('mousedown', alTocarFuera);
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('mousedown', alTocarFuera);
      document.removeEventListener('keydown', alTeclear);
    };
  }, [abierta]);

  return (
    <div ref={contenedorRef}>
      {/*
        La etiqueta y el botón de ayuda son hermanos, y el `label` envuelve solo
        al texto: dentro del `label`, tocar el botón además le daría el foco al
        campo, y el panel se abriría con el teclado encima.
      */}
      <div className="relative mb-1.5 flex items-center gap-1.5">
        <label htmlFor={idCampo} className="text-sm font-medium text-neutral-700">
          {etiqueta}
        </label>

        {tituloAyuda && (
          <>
            <button
              type="button"
              onClick={() => setAbierta((previo) => !previo)}
              aria-expanded={abierta}
              aria-label={tituloAyuda}
              className="inline-flex cursor-pointer text-neutral-400 transition-colors hover:text-[var(--color-primary)]"
            >
              <Info className="h-4 w-4" />
            </button>

            {abierta && (
              <div
                role="dialog"
                aria-label={tituloAyuda}
                className="absolute left-0 top-7 z-20 w-[min(20rem,calc(100vw-3rem))] rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_12px_32px_rgba(20,22,50,0.18)]"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold leading-snug text-neutral-800">
                    {tituloAyuda}
                  </p>
                  <button
                    type="button"
                    onClick={() => setAbierta(false)}
                    aria-label="Cerrar ayuda"
                    className="-mr-1 -mt-1 shrink-0 cursor-pointer rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {children}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AyudaDesplegable;
