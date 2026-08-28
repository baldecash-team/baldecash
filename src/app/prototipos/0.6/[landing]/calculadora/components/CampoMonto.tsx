'use client';

/**
 * Campo de importe de la calculadora.
 *
 * Es de texto y NO numérico a propósito. Un campo numérico responde a la rueda
 * del ratón mientras tiene el foco, así que desplazar la página con el puntero
 * encima sube o baja el importe sin que la persona lo advierta. Y el daño es
 * silencioso: la cuota se vuelve a simular con el monto nuevo, la pantalla
 * queda coherente consigo misma, y no queda rastro de que el número cambió.
 *
 * El precio de esa decisión es que el filtrado deja de hacerlo el navegador.
 * Lo hace `sanearMontoEscrito`.
 */

import React, { useEffect, useId, useRef, useState } from 'react';
import { Info, X } from 'lucide-react';
import { redondearSoles, sanearMontoEscrito } from '../types/calculadora';
import type { AyudaCampo } from '../perfiles';

interface CampoMontoProps {
  etiqueta: string;
  valor: number;
  placeholder: string;
  onCambio: (valor: number) => void;
  /** Sin ayuda no se dibuja el botón: no todos los importes necesitan explicación. */
  ayuda?: AyudaCampo;
}

export function CampoMonto({ etiqueta, valor, placeholder, onCambio, ayuda }: CampoMontoProps) {
  /**
   * El texto es estado propio del campo, no una proyección del importe.
   *
   * Hace falta porque un número no puede representar los estados intermedios
   * del tecleo: quien escribe 350.50 pasa por "350." antes de llegar, y ese
   * punto desaparecería en el viaje de ida y vuelta a número. Reescribirle el
   * campo a la mitad de una palabra es peor que dejarlo.
   */
  const [texto, setTexto] = useState(valor === 0 ? '' : String(valor));

  /**
   * La ayuda se abre a pedido, nunca sola.
   *
   * Explica cómo llegar a una pantalla ajena —el sistema de la institución— y
   * no todo el mundo la necesita: abrirla de entrada le tapa el campo a quien
   * ya tiene el número a mano.
   */
  const [ayudaAbierta, setAyudaAbierta] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const idCampo = useId();

  // Cerrar con Escape y al tocar fuera. Sin esto, en un teléfono el panel queda
  // abierto tapando el campo y la única salida es volver a tocar el botón.
  useEffect(() => {
    if (!ayudaAbierta) return;

    const alTocarFuera = (evento: MouseEvent) => {
      if (!contenedorRef.current?.contains(evento.target as Node)) setAyudaAbierta(false);
    };
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAyudaAbierta(false);
    };

    document.addEventListener('mousedown', alTocarFuera);
    document.addEventListener('keydown', alTeclear);
    return () => {
      document.removeEventListener('mousedown', alTocarFuera);
      document.removeEventListener('keydown', alTeclear);
    };
  }, [ayudaAbierta]);

  const alEscribir = (entrada: string) => {
    const saneado = sanearMontoEscrito(entrada);
    setTexto(saneado);

    // De un estado intermedio sale NaN, que acá se informa como cero: todavía
    // no hay importe que simular.
    const numero = Number.parseFloat(saneado);
    onCambio(Number.isFinite(numero) && numero >= 0 ? redondearSoles(numero) : 0);
  };

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

        {ayuda && (
          <>
            <button
              type="button"
              onClick={() => setAyudaAbierta((previo) => !previo)}
              aria-expanded={ayudaAbierta}
              aria-label={ayuda.titulo}
              className="inline-flex cursor-pointer text-neutral-400 transition-colors hover:text-[var(--color-primary)]"
            >
              <Info className="h-4 w-4" />
            </button>

            {ayudaAbierta && (
              <div
                role="dialog"
                aria-label={ayuda.titulo}
                className="absolute left-0 top-7 z-20 w-[min(20rem,calc(100vw-3rem))] rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_12px_32px_rgba(20,22,50,0.18)]"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold leading-snug text-neutral-800">
                    {ayuda.titulo}
                  </p>
                  <button
                    type="button"
                    onClick={() => setAyudaAbierta(false)}
                    aria-label="Cerrar ayuda"
                    className="-mr-1 -mt-1 shrink-0 cursor-pointer rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Lista numerada y no un párrafo: son pasos a seguir, en orden,
                    en otra pantalla. Corridos se leen como una sola instrucción. */}
                <ol className="list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-neutral-600">
                  {ayuda.pasos.map((paso) => (
                    <li key={paso}>{paso}</li>
                  ))}
                </ol>

                {ayuda.recomendacion && (
                  <p className="mt-3 rounded-lg bg-[#eef0ff] px-3 py-2 text-xs font-medium leading-relaxed text-[var(--color-primary)]">
                    {ayuda.recomendacion}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center rounded-xl border border-neutral-200 bg-white px-3 transition-colors focus-within:border-[var(--color-primary)]">
        <span className="mr-2 text-sm font-semibold text-[var(--color-primary)]">S/</span>
        <input
          id={idCampo}
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={texto}
          onChange={(evento) => alEscribir(evento.target.value)}
          className="w-full bg-transparent py-3 text-base text-neutral-800 outline-none placeholder:text-neutral-400"
        />
      </div>
    </div>
  );
}
